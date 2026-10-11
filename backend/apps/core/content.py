"""
Long-form copy for FAQ and legal pages, kept as data so the same text feeds the
React pages, FAQPage JSON-LD and llms-full.txt.

LEGAL NOTE: these are solid starting drafts written for FileSaviour's actual
data flows (browser vs server vs AI processing, 1-hour deletion). Have them
reviewed by a lawyer for your jurisdiction before launch.
"""

from django.conf import settings

LEGAL_UPDATED = "2026-10-11"

FAQ_GROUPS = [
    {
        "title": "Privacy & files",
        "items": [
            {"q": "What happens to my files after I upload them?",
             "a": "Files processed on our servers are stored in an isolated, encrypted scratch area, processed, and permanently deleted within one hour. Many tools (marked “In browser”) never upload your file at all."},
            {"q": "Which tools run entirely in my browser?",
             "a": "Merge, split, extract and crop PDF, image to PDF, sign PDF, add page numbers, PDF editor, every image compress/resize/crop/convert tool including the bulk versions, word counter and text analyzer. Your file never leaves your device with these."},
            {"q": "Do you use my documents to train AI?",
             "a": "No. Text sent to AI tools is processed by our AI provider under terms that prohibit training on it, and we delete it from our side within one hour."},
            {"q": "Can FileSaviour staff see my files?",
             "a": "No one browses user files. Automated systems process them and delete them. We only look at a specific file if you send it to support and ask us to."},
        ],
    },
    {
        "title": "Accounts & limits",
        "items": [
            {"q": "Do I need an account?",
             "a": "No. Every live tool works without signing up. A free account adds a 7-day history of results, higher file-size limits and saved preferences."},
            {"q": "What are the file size limits?",
             "a": f"Without an account, server tools accept files up to {settings.MAX_UPLOAD_MB_ANON} MB. With a free account the limit is {settings.MAX_UPLOAD_MB_USER} MB. Browser tools are limited only by your device's memory."},
            {"q": "Is FileSaviour really free?",
             "a": "Yes. The core tools are free. We keep costs down by running as much as possible in your browser."},
            {"q": "How do I delete my account?",
             "a": "Go to Dashboard → Settings → Delete account. Your profile, history and any stored results are erased immediately."},
        ],
    },
    {
        "title": "Tools & quality",
        "items": [
            {"q": "Will converting a PDF to Word keep my formatting?",
             "a": "Text, headings, tables and images are reconstructed. Very complex layouts, such as magazines or forms with overlapping elements, may need small manual fixes."},
            {"q": "How accurate are the AI detectors?",
             "a": "No AI detector is fully reliable. Our AI content and image detectors give a probability and show their signals. Use them as one input, never as proof against a person."},
            {"q": "Which browsers are supported?",
             "a": "The latest two versions of Chrome, Edge, Firefox and Safari on desktop and mobile."},
            {"q": "A tool failed. What should I do?",
             "a": f"Try again once, since most failures are temporary. If it keeps happening, email {settings.SUPPORT_EMAIL} with the tool name and file type. Don't attach sensitive files."},
        ],
    },
]


def faq_flat() -> list[dict]:
    return [item for group in FAQ_GROUPS for item in group["items"]]


TERMS = {
    "title": "Terms of Service",
    "updated": LEGAL_UPDATED,
    "intro": f"These terms govern your use of FileSaviour ({settings.SITE_URL}), operated by {settings.SITE_AUTHOR}. By using the service you agree to them.",
    "sections": [
        {"id": "service", "heading": "1. The service",
         "body": ["FileSaviour provides online tools to convert, edit, compress, analyse and generate files and text. Some tools run in your browser; others process files on our servers or through third-party AI providers, as labelled on each tool.",
                  "We may add, change or remove tools at any time. Tools marked “Beta” may produce imperfect results."]},
        {"id": "eligibility", "heading": "2. Eligibility & accounts",
         "body": ["You must be at least 13 years old (or the minimum age in your country) to use FileSaviour, and at least 16 to create an account in the EEA/UK.",
                  "You are responsible for keeping your login credentials secure and for all activity under your account."]},
        {"id": "your-content", "heading": "3. Your content",
         "body": ["You keep all rights to the files and text you upload (“Your Content”). You grant us a limited licence to store and process Your Content solely to provide the tool you requested, for no longer than our retention period.",
                  "You confirm you have the rights needed to process Your Content, including any third-party copyrights, trademarks or personal data in it."]},
        {"id": "acceptable-use", "heading": "4. Acceptable use",
         "body": ["You must not use FileSaviour to: infringe intellectual property (including removing watermarks or copyright notices from work you do not own); process unlawful content; commit academic dishonesty or fraud; forge signatures or documents; distribute malware; or overload, probe or reverse-engineer the service.",
                  "We may suspend access, delete content or report activity to authorities where we reasonably believe these rules have been broken."]},
        {"id": "ai", "heading": "5. AI features",
         "body": ["AI outputs (summaries, rewrites, detection scores, translations) are generated automatically and can be wrong. Review them before relying on them.",
                  "Detection scores are probabilistic and must not be the sole basis for decisions about a person, such as academic misconduct or employment."]},
        {"id": "fees", "heading": "6. Fees",
         "body": ["Core tools are free. If we introduce paid plans, prices and terms will be shown before you buy, and these terms will be updated."]},
        {"id": "ip", "heading": "7. Our intellectual property",
         "body": ["FileSaviour's source code is open source under the MIT License (https://github.com/ahmershahdev/filesaviour). The FileSaviour name and logo are not covered by that license and may not be used to imply endorsement without permission."]},
        {"id": "disclaimer", "heading": "8. Disclaimers",
         "body": ["The service is provided “as is” and “as available”. To the extent permitted by law we disclaim all warranties, including fitness for a particular purpose and non-infringement. Keep your own copy of important files; we do not provide backups."]},
        {"id": "liability", "heading": "9. Limitation of liability",
         "body": ["To the extent permitted by law, we are not liable for indirect, incidental or consequential damages, or for loss of data or profits. Our total liability for any claim is limited to the greater of USD 50 or the amount you paid us in the previous 12 months.",
                  "Nothing in these terms limits liability that cannot be limited by law."]},
        {"id": "termination", "heading": "10. Termination",
         "body": ["You can stop using the service and delete your account at any time. We may suspend or terminate access for breach of these terms."]},
        {"id": "changes", "heading": "11. Changes",
         "body": ["We may update these terms. Material changes will be announced on the site or by email at least 14 days before they take effect."]},
        {"id": "contact", "heading": "12. Contact",
         "body": [f"Questions about these terms: {settings.SUPPORT_EMAIL}."]},
    ],
}

PRIVACY = {
    "title": "Privacy Policy",
    "updated": LEGAL_UPDATED,
    "intro": "FileSaviour is built to need as little of your data as possible. This policy explains what we collect, why, and how long we keep it.",
    "sections": [
        {"id": "summary", "heading": "Summary",
         "body": ["Browser tools never upload your files. Server and AI tools delete files within 1 hour. We don't sell personal data, and we don't use your files to train AI."]},
        {"id": "controller", "heading": "1. Who we are",
         "body": [f"The data controller is {settings.SITE_AUTHOR}, operating FileSaviour at {settings.SITE_URL}. Contact: {settings.SUPPORT_EMAIL}."]},
        {"id": "collect", "heading": "2. What we collect",
         "body": ["Files and text you submit to server or AI tools, processed only to deliver your result.",
                  "Account data if you register: email, display name, hashed password, preferences.",
                  "Job metadata: tool used, file type, size, duration and success or failure. This is kept without file contents for service statistics.",
                  "Technical data: IP address (truncated for analytics), browser type and coarse location, used for security, abuse prevention and rate limiting."]},
        {"id": "files", "heading": "3. File processing & retention",
         "body": ["In-browser tools: your file is processed on your device and is never sent to us.",
                  "Server tools: files go over TLS to an isolated processing service, are stored encrypted at rest, and are permanently deleted within 1 hour, or immediately when you click “Delete now”.",
                  "AI tools: text or file contents are sent to our AI provider (Anthropic) for processing under terms that prohibit training on API data. We delete our copy within 1 hour.",
                  "Account history keeps result files for up to 7 days if you enable it, and you can delete them at any time."]},
        {"id": "basis", "heading": "4. Legal bases (GDPR/UK GDPR)",
         "body": ["Performance of a contract: processing files you submit and running your account.",
                  "Legitimate interests: security, fraud and abuse prevention, and aggregate service analytics.",
                  "Consent: optional analytics cookies and marketing email. You can withdraw consent at any time."]},
        {"id": "sharing", "heading": "5. Who we share data with",
         "body": ["Infrastructure and hosting providers, the AI provider for AI tools, and an email delivery provider for account emails. All are bound by data processing agreements. We never sell or rent personal data."]},
        {"id": "transfers", "heading": "6. International transfers",
         "body": ["Some providers process data outside your country. Where required, transfers rely on Standard Contractual Clauses or equivalent safeguards."]},
        {"id": "cookies", "heading": "7. Cookies",
         "body": ["Essential cookies: session, CSRF protection and theme preference. Optional: privacy-friendly analytics, only with your consent. See the Cookie Policy for details."]},
        {"id": "rights", "heading": "8. Your rights",
         "body": [f"You may access, correct, export or delete your data, object to or restrict processing, and complain to your data protection authority. California residents have equivalent CCPA/CPRA rights. Email {settings.SUPPORT_EMAIL}; we reply within 30 days."]},
        {"id": "security", "heading": "9. Security",
         "body": ["TLS everywhere, encryption at rest, isolated processing containers without internet access, least-privilege access, and automated deletion. No system is perfectly secure, and we will notify you of a breach affecting your data as required by law."]},
        {"id": "children", "heading": "10. Children",
         "body": ["FileSaviour is not directed at children under 13, and we do not knowingly collect their data."]},
        {"id": "changes", "heading": "11. Changes",
         "body": ["We will post updates here and change the date above. Material changes will be announced in advance."]},
    ],
}

COOKIES = {
    "title": "Cookie Policy",
    "updated": LEGAL_UPDATED,
    "intro": "FileSaviour uses very few cookies. Essential ones keep the site secure. Everything else is optional.",
    "sections": [
        {"id": "essential", "heading": "Essential",
         "body": ["sessionid: keeps you signed in (session or 2 weeks).", "csrftoken: protects forms against cross-site request forgery (1 year).", "fs-theme (localStorage): remembers light or dark mode."]},
        {"id": "analytics", "heading": "Analytics (optional)",
         "body": ["Cookieless, privacy-friendly page analytics with no cross-site tracking. Enabled only after consent where the law requires it."]},
        {"id": "control", "heading": "Your choices",
         "body": ["Change your choice at any time from “Cookie settings” in the footer, or block cookies in your browser. Blocking essential cookies will stop sign-in from working."]},
    ],
}
