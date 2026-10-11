from pathlib import Path

from . import ProcessingError, processor
from ._run import run, stem


@processor("compress-gif")
def compress_gif(inputs: list[Path], options: dict, work: Path) -> Path:
    lossy = max(0, min(int(options.get("lossy", 80)), 200))
    colors = max(2, min(int(options.get("colors", 128)), 256))
    out = work / f"{stem(inputs[0], 'animation')}-small.gif"
    run(["gifsicle", "-O3", f"--lossy={lossy}", f"--colors={colors}", str(inputs[0]), "-o", str(out)])
    return out


@processor("remove-background")
def remove_background(inputs: list[Path], options: dict, work: Path) -> Path:
    from PIL import Image
    from rembg import remove  # loads an ONNX model on first use

    try:
        img = Image.open(inputs[0])
        img.load()
    except Exception as exc:
        raise ProcessingError("That image couldn't be opened.") from exc
    if img.width * img.height > 40_000_000:
        raise ProcessingError("Images above 40 megapixels aren't supported.")
    out = work / f"{stem(inputs[0], 'image')}-cutout.png"
    remove(img).save(out, optimize=True)
    return out


@processor("file-optimizer")
def file_optimizer(inputs: list[Path], options: dict, work: Path) -> Path:
    """Strip metadata and re-encode images; PDFs go through qpdf linearise + object streams."""
    src = inputs[0]
    suffix = src.suffix.lower()
    out = work / f"{stem(src)}-optimized{suffix}"
    if suffix == ".pdf":
        run(["qpdf", "--object-streams=generate", "--compress-streams=y", "--linearize", str(src), str(out)])
    elif suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        from PIL import Image

        # Pillow only writes EXIF/XMP/ICC when passed explicitly, so a plain save strips them.
        Image.open(src).save(out, optimize=True, quality=82)
    else:
        raise ProcessingError("This file type can't be optimised yet.")
    if out.stat().st_size >= src.stat().st_size:
        out.unlink()
        src.rename(out)
    return out
