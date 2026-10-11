import secrets
from pathlib import Path

import pikepdf

from . import ProcessingError, processor
from ._run import run

GS_PRESETS = {"light": "/printer", "balanced": "/ebook", "strong": "/screen"}


@processor("compress-pdf")
def compress_pdf(inputs: list[Path], options: dict, work: Path) -> Path:
    level = GS_PRESETS.get(options.get("level", "balanced"), "/ebook")
    out = work / "compressed.pdf"
    run([
        "gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.6", f"-dPDFSETTINGS={level}",
        "-dNOPAUSE", "-dBATCH", "-dQUIET", "-dSAFER", "-dDetectDuplicateImages=true",
        f"-sOutputFile={out}", str(inputs[0]),
    ])
    # Ghostscript can make already-optimised files bigger; never return a worse file.
    if out.stat().st_size >= inputs[0].stat().st_size:
        out.unlink()
        inputs[0].rename(out)
    return out


@processor("protect-pdf")
def protect_pdf(inputs: list[Path], options: dict, work: Path) -> Path:
    password = str(options.get("password", ""))
    if len(password) < 4:
        raise ProcessingError("Choose a password of at least 4 characters.")
    allow = pikepdf.Permissions(
        print_lowres=bool(options.get("allowPrint", True)),
        print_highres=bool(options.get("allowPrint", True)),
        extract=bool(options.get("allowCopy", False)),
        modify_other=bool(options.get("allowEdit", False)),
    )
    out = work / "protected.pdf"
    try:
        with pikepdf.open(inputs[0]) as pdf:
            pdf.save(out, encryption=pikepdf.Encryption(owner=secrets.token_urlsafe(24), user=password, R=6, allow=allow))
    except pikepdf.PasswordError as exc:
        raise ProcessingError("This PDF is already password-protected.") from exc
    return out


@processor("ocr-pdf")
def ocr_pdf(inputs: list[Path], options: dict, work: Path) -> Path:
    lang = "+".join(code for code in options.get("languages", ["eng"]) if code.isalpha())[:40] or "eng"
    out = work / "searchable.pdf"
    run(["ocrmypdf", "--skip-text", "--optimize", "1", "-l", lang, str(inputs[0]), str(out)], timeout=280)
    return out


# html-to-pdf is intentionally not registered: rendering untrusted HTML in a
# browser needs its own no-network sandbox (SSRF and file:// reads). Until that
# worker exists the engine answers 501 for it.
