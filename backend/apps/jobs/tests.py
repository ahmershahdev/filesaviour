import json

from django.test import TestCase, override_settings

from apps.jobs import selectors, services
from apps.jobs.models import Job

VITE_DEV = {"default": {"dev_mode": True, "dev_server_port": 5173}}


@override_settings(DJANGO_VITE=VITE_DEV, ALLOWED_HOSTS=["testserver"], CELERY_TASK_ALWAYS_EAGER=True)
class JobApiTests(TestCase):
    def test_browser_tools_are_rejected_by_upload_api(self):
        self.assertEqual(self.client.post("/api/jobs", {"tool": "merge-pdf"}).status_code, 400)

    def test_jobs_are_private_to_their_session(self):
        self.client.post("/api/jobs/log", json.dumps({"tool": "word-counter"}), content_type="application/json")
        job = Job.objects.get()
        self.assertEqual(self.client.get(f"/api/jobs/{job.id}").status_code, 200)
        self.assertEqual(self.client_class().get(f"/api/jobs/{job.id}").status_code, 404)

    def test_log_rejects_garbage_without_500(self):
        for body in ("[1,2]", "not json", json.dumps({"tool": "word-counter", "inputBytes": "lots"})):
            r = self.client.post("/api/jobs/log", body, content_type="application/json")
            self.assertIn(r.status_code, (201, 400), body)


class JobServiceTests(TestCase):
    def test_browser_run_log_clamps_sizes(self):
        job = services.browser_run_log(slug="word-counter", input_bytes=-5, output_bytes="x",
                                       owner=services.Owner(user=None, session_key="s"))
        self.assertEqual((job.input_bytes, job.output_bytes, job.bytes_saved), (0, 0, 0))

    def test_server_tool_guard(self):
        for slug in ("merge-pdf", "plagiarism-checker", "nope"):
            with self.assertRaises(services.JobError):
                services.server_tool_or_error(slug)
        self.assertEqual(services.server_tool_or_error("compress-pdf").slug, "compress-pdf")

    def test_daily_runs_has_one_row_per_day(self):
        services.browser_run_log(slug="word-counter", input_bytes=1, output_bytes=1, owner=services.Owner(None, "s"))
        days = selectors.daily_runs(days=14)
        self.assertEqual(len(days), 14)
        self.assertEqual(days[-1]["runs"], 1)
