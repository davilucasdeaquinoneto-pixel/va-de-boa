"""Testa o build em um navegador real com os cabeçalhos do render.yaml.

Requer Selenium, PyYAML, o navegador e seu WebDriver instalados. Execute
python3 scripts/build.py antes de python3 tests/navegador.py.
"""

import os
import re
import shutil
import threading
import unittest
from fnmatch import fnmatchcase
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import urlopen

import yaml
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.support.ui import WebDriverWait


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
CONFIG = yaml.safe_load((ROOT / "render.yaml").read_text(encoding="utf-8"))["services"][0]
PUBLIC_CARDS = "https://va-de-boa-turma41.onrender.com/#cards"


class StaticSite(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):
        path = urlsplit(self.path).path
        for rule in CONFIG["headers"]:
            if fnmatchcase(path, rule["path"]):
                self.send_header(rule["name"], rule["value"])
        super().end_headers()

    def send_error(self, code, *args):
        if code != 404:
            return super().send_error(code, *args)
        self.send_content(404, "text/html; charset=utf-8", (DIST / "404.html").read_bytes())

    def send_content(self, status, mime, data, headers=None):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def serve_video(self, asset):
        data = asset.read_bytes()
        size = len(data)
        headers = {"Accept-Ranges": "bytes"}
        requested = self.headers.get("Range")
        if not requested:
            return self.send_content(200, "video/mp4", data, headers)
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested)
        if not match or not any(match.groups()):
            return self.send_content(416, "text/plain", b"", {"Content-Range": f"bytes */{size}"})
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start > end:
            return self.send_content(416, "text/plain", b"", {"Content-Range": f"bytes */{size}"})
        headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        self.send_content(206, "video/mp4", data[start:end + 1], headers)

    def do_GET(self):
        try:
            self.serve_file()
        except (BrokenPipeError, ConnectionResetError):
            # Um player pode encerrar o download assim que recebe os metadados.
            pass

    def serve_file(self):
        if self.path.startswith("/campos-antigos/"):
            self.path = self.path.removeprefix("/campos-antigos")
            if urlsplit(self.path).path == "/":
                html = (DIST / "index.html").read_bytes()
                html = html.replace(b' maxlength="200"', b'').replace(b' data-navigation-fallback', b'')
                return self.send_content(200, "text/html; charset=utf-8", html)
        # Uma cópia do site recebe um JS que difere por uma quebra de linha.
        # As URLs têm um prefixo próprio para isolar o cache desse cenário.
        if self.path.startswith("/versao-defasada/"):
            self.path = self.path.removeprefix("/versao-defasada")
            path = urlsplit(self.path).path
            if path.startswith("/assets/") and path.endswith(".js"):
                asset = DIST / "assets" / Path(path).name
                return self.send_content(200, "text/javascript", asset.read_bytes() + b"\n")
        path = urlsplit(self.path).path
        if path.startswith("/assets/") and path.endswith(".mp4"):
            asset = DIST / "assets" / Path(path).name
            if asset.is_file():
                return self.serve_video(asset)
        super().do_GET()


def browser():
    if os.environ.get("TEST_BROWSER") == "firefox":
        options = webdriver.FirefoxOptions()
        options.add_argument("-headless")
        return webdriver.Firefox(options=options, service=FirefoxService(shutil.which("geckodriver")))
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.binary_location = shutil.which("google-chrome") or shutil.which("chromium")
    return webdriver.Chrome(options=options, service=ChromeService(shutil.which("chromedriver")))


class Navegador(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = partial(StaticSite, directory=str(DIST))
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.addClassCleanup(cls.server.server_close)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.addClassCleanup(cls.server.shutdown)
        cls.url = f"http://127.0.0.1:{cls.server.server_port}"
        cls.driver = browser()
        cls.addClassCleanup(cls.driver.quit)
        cls.driver.set_page_load_timeout(25)

    def open_page(self, fragment="inicio"):
        self.driver.get(self.url + "/?origem=teste#" + fragment)
        self.wait(lambda d: d.execute_script("return document.documentElement.classList.contains('app-ready')"))
        self.wait(lambda d: self.element("#" + fragment).is_displayed())

    def wait(self, condition):
        return WebDriverWait(self.driver, 8, poll_frequency=0.1).until(condition)

    def element(self, selector):
        return self.driver.find_element(By.CSS_SELECTOR, selector)

    def click(self, element):
        # Posiciona o controle antes do clique real, inclusive após saltos do FAQ.
        def in_view(driver):
            return driver.execute_script("""
                const el = arguments[0];
                el.scrollIntoView({block: "center", inline: "nearest", behavior: "instant"});
                const rect = el.getBoundingClientRect();
                const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
                return hit && (hit === el || el.contains(hit));
            """, element)
        self.wait(in_view)
        element.click()

    def test_menu_busca_e_faq_em_duas_larguras(self):
        for width, height in ((390, 844), (1366, 768)):
            with self.subTest(width=width):
                self.driver.set_window_size(width, height)
                self.open_page()
                self.click(self.element("#menu-toggle"))
                self.wait(lambda d: self.element("#menu-dialog").is_displayed())
                search = self.element("#drawer-guide-search")
                search.clear()
                search.send_keys("CNH")
                result = self.wait(lambda d: self.element("#drawer-guide-results a[href^='#faq-']"))
                target = urlsplit(result.get_attribute("href")).fragment
                self.click(result)
                self.wait(lambda d: self.element("#" + target).is_displayed())
                self.assertFalse(self.element("#menu-dialog").is_displayed())
                self.click(self.element('[data-faq-filter="bateria"]'))
                self.assertEqual(self.element('[data-faq-filter="bateria"]').get_attribute("aria-pressed"), "true")
                self.driver.back()
                self.wait(lambda d: self.element("#inicio").is_displayed())

    def test_rotas_e_cards(self):
        self.open_page()
        routes = self.driver.execute_script("return [...new Set([...document.querySelectorAll('[data-page]')].map(el => el.dataset.page))]")
        for route in routes:
            self.driver.get(self.url + "/?origem=teste#" + route)
            self.wait(lambda d: d.execute_script("return [...document.querySelectorAll('[data-page]')].every(el => el.hidden === (el.dataset.page !== arguments[0]))", route))
        self.open_page("cards")
        buttons = self.driver.find_elements(By.CSS_SELECTOR, "[data-open-card]")
        self.assertEqual(len(buttons), len(self.driver.find_elements(By.CSS_SELECTOR, "#print-root .print-page")))
        for button in buttons:
            expected = self.element("#" + button.get_attribute("data-open-card")).get_attribute("data-title")
            self.click(button)
            self.assertEqual(self.element("#card-dialog-title").text, expected)
            self.click(self.element('[data-close-dialog="card-dialog"]'))

    def test_preparacao_da_impressao_individual(self):
        self.open_page("cards")
        count = len(self.driver.find_elements(By.CSS_SELECTOR, "[data-print-card]"))
        self.driver.execute_script("""
            window.print = () => {
                window.dispatchEvent(new Event("beforeprint"));
                const pages = document.querySelectorAll("#print-root .print-page");
                window.impressao = {count: pages.length, title: pages[0].querySelector("h3").textContent};
                window.dispatchEvent(new Event("afterprint"));
            };
        """)
        title = self.element("#card-2 h3").get_attribute("textContent")
        self.click(self.element('[data-print-card="card-2"]'))
        printed = self.wait(lambda d: d.execute_script("return window.impressao"))
        self.assertEqual(printed, {"count": 1, "title": title})
        self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, "#print-root .print-page")), count)
        self.assertTrue(self.element('[data-print-card="card-2"]').is_enabled())
        self.driver.refresh()

    def test_compartilhamento_copia_cancelamento_e_link_manual(self):
        self.open_page("cards")
        button = self.element('[data-share-card="card-1"]')
        js = self.driver.execute_script
        js("Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.enviado = data.url } })")
        self.click(button)
        self.wait(lambda d: js("return window.enviado") == PUBLIC_CARDS)
        js("Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {writeText: async t => { window.copiado = t }} }); Object.defineProperty(navigator, 'share', {configurable: true, value: async () => { throw new DOMException('Cancelado','AbortError') }})")
        self.click(button)
        self.assertIsNone(js("return window.copiado"))
        self.assertFalse(self.element("#share-fallback").is_displayed())
        js("Object.defineProperty(navigator, 'share', {configurable: true, value: undefined})")
        self.click(button)
        copied = self.wait(lambda d: js("return window.copiado"))
        self.assertTrue(copied.endswith(PUBLIC_CARDS))
        self.assertNotIn("origem=teste", copied)
        js("navigator.clipboard.writeText = async () => { throw new Error('indisponível') }")
        self.click(button)
        self.wait(lambda d: self.element("#share-fallback").is_displayed())
        self.assertEqual(self.driver.switch_to.active_element.get_attribute("id"), "public-cards-link")
        self.assertEqual(self.element("#public-cards-link").get_attribute("href"), PUBLIC_CARDS)

    def test_css_videos_legenda_e_404(self):
        self.open_page("videos")
        self.assertTrue(self.driver.execute_script("return [...document.querySelectorAll('link[rel=stylesheet]')].every(el => el.sheet && el.sheet.cssRules.length)"))
        videos = self.driver.find_elements(By.CSS_SELECTOR, "video")
        self.assertEqual(len(videos), 2)
        for video in videos:
            self.driver.execute_script("arguments[0].load()", video)
            try:
                self.wait(lambda d: d.execute_script("return arguments[0].videoWidth > 0 && arguments[0].duration > 0", video))
            except TimeoutException:
                details = self.driver.execute_script("""
                    const v = arguments[0];
                    return {source:v.currentSrc, ready:v.readyState, network:v.networkState,
                            error:v.error?.message, h264:v.canPlayType('video/mp4; codecs="avc1.42E01E"')};
                """, video)
                self.fail(f"Vídeo sem metadados: {details}")
            self.driver.execute_script("const v = arguments[0]; v.muted = true; v.play()", video)
            self.wait(lambda d: d.execute_script("return arguments[0].currentTime > 0", video))
            self.driver.execute_script("arguments[0].pause()", video)
        self.driver.execute_script("document.querySelector('track').track.mode = 'showing'")
        self.wait(lambda d: d.execute_script("return document.querySelector('track').track.cues?.length > 0"))
        self.driver.get(self.url + "/rota/ausente")
        self.assertIn("Página não encontrada", self.driver.title)
        self.assertTrue(self.driver.execute_script("return document.querySelector('link[rel=stylesheet]').sheet.cssRules.length > 0"))
        self.click(self.element('a[href="/#inicio"]'))
        self.wait(lambda d: self.element("#inicio").is_displayed())

    def test_arquivo_defasado_preserva_consulta(self):
        self.driver.get(self.url + "/versao-defasada/#faq-cnh-placa")
        self.assertFalse(self.driver.execute_script("return document.documentElement.classList.contains('app-ready')"))
        self.assertTrue(self.element("#faq-cnh-placa").is_displayed())
        self.assertTrue(self.element(".nojs-nav").is_displayed())
        self.assertFalse(self.element("#menu-toggle").is_displayed())
        self.assertEqual(self.driver.execute_script("return getComputedStyle(document.documentElement).scrollBehavior"), "auto")
        self.click(self.element('.nojs-nav a[href="#videos"]'))
        self.wait(lambda d: urlsplit(d.current_url).fragment == "videos")
        self.wait(lambda d: d.execute_script("const r = document.querySelector(\'#videos\').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0"))

    def test_campos_de_busca_do_html_anterior(self):
        self.driver.get(self.url + "/campos-antigos/?origem=teste#inicio")
        self.wait(lambda d: d.execute_script("return document.documentElement.classList.contains('app-ready')"))
        field = self.element("#home-guide-search")
        self.assertEqual(field.get_attribute("maxlength"), "200")
        field.send_keys("CNH")
        self.wait(lambda d: self.element("#home-guide-results a[href^='#faq-']").is_displayed())

    def test_cabecalhos_da_configuracao(self):
        with urlopen(self.url + "/", timeout=4) as response:
            self.assertEqual(response.headers["Referrer-Policy"], "no-referrer")
            self.assertIn("frame-ancestors 'none'", response.headers["Content-Security-Policy"])
            self.assertEqual(response.headers["Integrity-Policy"], "blocked-destinations=(script style)")


if __name__ == "__main__":
    unittest.main(verbosity=2)
