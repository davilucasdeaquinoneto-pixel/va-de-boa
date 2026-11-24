"""Regressões do pacote publicado. Executar a partir da raiz com unittest discover."""

import base64
import hashlib
import shutil
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

from scripts.build import PUBLIC_ASSETS, ROOT, build


class Tags(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.items = []
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attributes):
        self.items.append((tag, dict(attributes)))


class Publicacao(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls.folder.cleanup)
        cls.root = Path(cls.folder.name)
        for name in ("index.html", "404.html", "robots.txt"):
            shutil.copyfile(ROOT / name, cls.root / name)
        shutil.copytree(ROOT / "assets", cls.root / "assets")
        build(cls.root)
        cls.dist = cls.root / "dist"

    def test_pacote_contem_apenas_arquivos_publicos(self):
        actual = {p.relative_to(self.dist).as_posix() for p in self.dist.rglob("*") if p.is_file()}
        self.assertEqual(actual, {"index.html", "404.html", "robots.txt"} |
                         {"assets/" + name for name in PUBLIC_ASSETS})
        self.assertEqual(len(list((self.dist / "assets").glob("*.js"))), 1)

    def test_integridade_e_cache_conferem_com_os_bytes(self):
        for page in ("index.html", "404.html"):
            elements = Tags((self.dist / page).read_text(encoding="utf-8")).items
            sheets = set()
            style_preloads = set()
            script_hashes = set()
            csp = next(a["content"] for t, a in elements
                       if t == "meta" and a.get("http-equiv", "").lower() == "content-security-policy")
            for tag, attrs in elements:
                if tag != "script" and not (tag == "link" and
                        (attrs.get("rel") == "stylesheet" or attrs.get("as") == "style")):
                    continue
                url = attrs.get("src") or attrs["href"]
                parts = urlsplit(url)
                data = (self.dist / parts.path.lstrip("/")).read_bytes()
                digest = hashlib.sha384(data)
                expected = "sha384-" + base64.b64encode(digest.digest()).decode("ascii")
                with self.subTest(page=page, url=url):
                    self.assertEqual(attrs.get("integrity"), expected)
                    self.assertEqual(attrs.get("crossorigin"), "anonymous")
                    self.assertEqual(parts.query, "v=" + digest.hexdigest()[:16])
                if tag == "script":
                    script_hashes.add("'" + expected + "'")
                elif attrs.get("rel") == "stylesheet":
                    sheets.add(url)
                else:
                    style_preloads.add(url)
            self.assertTrue(sheets)
            self.assertTrue(style_preloads.issubset(sheets))
            self.assertNotIn("frame-ancestors", csp)
            if page == "index.html":
                script_src = next(d.strip() for d in csp.split(";") if d.strip().startswith("script-src "))
                self.assertTrue(script_hashes)
                self.assertEqual(set(script_src.split()[1:]), script_hashes)
            else:
                self.assertFalse(script_hashes)
                self.assertIn("default-src 'none'", csp)

    def test_navegacao_permanece_legivel_sem_script(self):
        tags = Tags((self.dist / "index.html").read_text(encoding="utf-8")).items
        ids = [a["id"] for _, a in tags if "id" in a]
        self.assertEqual(len(ids), len(set(ids)))
        for tag, a in tags:
            if "data-page" in a:
                self.assertNotIn("hidden", a)
            if tag == "a" and a["href"].startswith("#"):
                self.assertIn(a["href"][1:], ids)
            if tag == "a" and a.get("target") == "_blank":
                self.assertTrue({"noopener", "noreferrer"}.issubset(a.get("rel", "").split()))
        self.assertIn("cards", ids)

    def test_falha_de_build_preserva_saida_anterior(self):
        previous = (self.dist / "index.html").read_bytes()
        source = self.root / "assets" / "404.css"
        original = source.read_bytes()
        try:
            source.unlink()
            with self.assertRaises(ValueError):
                build(self.root)
            self.assertEqual((self.dist / "index.html").read_bytes(), previous)
        finally:
            source.write_bytes(original)
        build(self.root)
        self.assertEqual((self.dist / "index.html").read_bytes(), previous)

    def test_rebuild_atualiza_hash_e_versao_do_css(self):
        source = self.root / "assets" / "404.css"
        original = source.read_bytes()
        page = self.dist / "404.html"
        previous = page.read_text(encoding="utf-8")
        try:
            source.write_bytes(original + b"\n/* nova revisao de teste */\n")
            build(self.root)
            self.assertNotEqual(page.read_text(encoding="utf-8"), previous)
        finally:
            source.write_bytes(original)
            build(self.root)
        self.assertEqual(page.read_text(encoding="utf-8"), previous)


if __name__ == "__main__":
    unittest.main()
