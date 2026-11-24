"""Monta o site estático com recursos locais e integridade calculada sobre os bytes publicados."""

import re
from base64 import b64encode
from hashlib import sha384
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from shutil import copyfile
from tempfile import TemporaryDirectory


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ASSETS = {
    "404.css",
    "app.20261029.navigationfix.js",
    "bike-hero.82c05c9b30be.webp",
    "favicon.c92632b67411.svg",
    "guide-expansion.20261029.css",
    "navigation-guides.20261029.css",
    "rules-guide.20261029.css",
    "styles.2772bc3939d3.css",
    "video-campanha-legendas.bc018bba7045.vtt",
    "video-campanha-poster.b1a08639f8f3.jpg",
    "video-campanha.3993a9c8ff4e.mp4",
    "video-guia-site-poster.026d247e8e2b.jpg",
    "video-guia-site.899de5d30b46.mp4",
}


class Page(HTMLParser):
    """Preserva o HTML e o SVG autorais ao atualizar as tags de recursos e a CSP."""

    def __init__(self, source, assets):
        super().__init__(convert_charrefs=False)
        self.assets = assets
        self.used = set()
        self.script_hashes = set()
        self.edits = []
        self.csp = None
        self.lines = [0, *(m.end() for m in re.finditer("\n", source))]
        self.feed(source)
        self.close()

    def use_asset(self, url):
        path = (url or "").removeprefix("/")
        if path not in self.assets:
            raise ValueError(f"Recurso fora da lista de publicação na linha {self.getpos()[0]}: {url}")
        self.used.add(path)
        return self.assets[path]

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        raw = self.get_starttag_text()
        line, column = self.getpos()
        start = self.lines[line - 1] + column
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "content-security-policy":
            self.csp = (start, raw)
            return
        if tag in {"style", "base"} or any(key == "style" or key.startswith("on") for key in attrs):
            raise ValueError(f"Tag ou atributo incompatível com a CSP na linha {line}")
        if tag == "script" and not attrs.get("src"):
            raise ValueError(f"Script sem arquivo local na linha {line}")

        if tag == "video" and "poster" in attrs:
            self.use_asset(attrs["poster"])
        if tag in {"script", "source", "track", "img", "video", "audio"} and "src" in attrs:
            key = "src"
        elif tag == "link" and attrs.get("rel") in {"stylesheet", "preload", "icon"}:
            key = "href"
        else:
            return

        url = attrs.get(key)
        asset = self.use_asset(url)
        is_script = tag == "script" or (tag == "link" and attrs.get("as") == "script")
        is_style = tag == "link" and (attrs.get("rel") == "stylesheet" or attrs.get("as") == "style")
        if not (is_script or is_style):
            return
        if asset.suffix != (".js" if is_script else ".css"):
            raise ValueError(f"Tipo de recurso incorreto na linha {line}: {url}")
        digest = sha384(asset.read_bytes())
        integrity = "sha384-" + b64encode(digest.digest()).decode("ascii")
        if tag == "script":
            self.script_hashes.add("'" + integrity + "'")
        # O preload e a folha efetiva devem ter a mesma URL, integridade e modo CORS.
        attrs[key] = f"{url}?v={digest.hexdigest()[:16]}"
        attrs.update(integrity=integrity, crossorigin="anonymous")
        rendered = "".join(
            " " + name if value is None else f' {name}="{escape(value, quote=True)}"'
            for name, value in attrs.items()
        )
        self.edits.append((start, raw, f"<{tag}{rendered}>"))

    def render(self, source):
        if not self.csp:
            raise ValueError("Página sem CSP")
        if self.script_hashes:
            start, raw = self.csp
            if raw.count("script-src 'self';") != 1:
                raise ValueError("Não foi possível restringir a CSP aos scripts da página")
            pinned = "script-src " + " ".join(sorted(self.script_hashes)) + ";"
            self.edits.append((start, raw, raw.replace("script-src 'self';", pinned)))
        for start, raw, replacement in sorted(self.edits, reverse=True):
            source = source[:start] + replacement + source[start + len(raw):]
        return source


def source_file(root, path):
    source = root / path
    if source.resolve() != source or not source.is_file():
        raise ValueError(f"Arquivo de publicação ausente ou simbólico: {path}")
    return source


def build(root=ROOT):
    root = root.resolve()
    dist = root / "dist"
    with TemporaryDirectory(dir=root) as temporary:
        staging = Path(temporary) / "site"
        (staging / "assets").mkdir(parents=True)
        assets = {}
        for name in sorted(PUBLIC_ASSETS):
            path = "assets/" + name
            copyfile(source_file(root, path), staging / path)
            assets[path] = staging / path

        used = set()
        for name in ("index.html", "404.html"):
            source = source_file(root, name).read_text(encoding="utf-8")
            page = Page(source, assets)
            (staging / name).write_text(page.render(source), encoding="utf-8")
            used.update(page.used)
        if used != assets.keys():
            raise ValueError(f"Recursos públicos sem referência: {sorted(assets.keys() - used)}")
        copyfile(source_file(root, "robots.txt"), staging / "robots.txt")

        # Só substitui a saída anterior depois de completar todas as verificações.
        previous = Path(temporary) / "anterior"
        if dist.exists():
            dist.rename(previous)
        try:
            staging.rename(dist)
        except OSError:
            if previous.exists() and not dist.exists():
                previous.rename(dist)
            raise


if __name__ == "__main__":
    build()
