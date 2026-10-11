from pathlib import Path

from . import ProcessingError, processor
from ._run import run, stem

TARGETS = {"pdf", "docx", "odt", "rtf", "txt", "xlsx", "csv", "pptx", "html"}


def _soffice(src: Path, target: str, work: Path) -> Path:
    out_dir = work / "out"
    out_dir.mkdir(exist_ok=True)
    # Isolated profile dir: concurrent LibreOffice runs otherwise lock each other.
    run([
        "soffice", f"-env:UserInstallation=file://{work}/lo-profile", "--headless", "--norestore",
        "--convert-to", target, "--outdir", str(out_dir), str(src),
    ])
    results = list(out_dir.iterdir())
    if not results:
        raise ProcessingError("Conversion produced no output.")
    return results[0]


@processor("word-to-pdf")
def word_to_pdf(inputs, options, work):
    out = _soffice(inputs[0], "pdf", work)
    return out.rename(work / f"{stem(inputs[0], 'document')}.pdf")


@processor("pdf-to-word")
def pdf_to_word(inputs, options, work):
    from pdf2docx import Converter  # heavy import, only when used

    out = work / f"{stem(inputs[0], 'document')}.docx"
    cv = Converter(str(inputs[0]))
    try:
        cv.convert(str(out))
    finally:
        cv.close()
    return out


@processor("file-converter")
def file_converter(inputs: list[Path], options: dict, work: Path) -> Path:
    target = str(options.get("target", "pdf")).lower()
    if target not in TARGETS:
        raise ProcessingError(f"Can't convert to {target!r}.")
    return _soffice(inputs[0], target, work)
