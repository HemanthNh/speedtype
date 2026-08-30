window.TESTING_DRILLS = {
  "Python Automation": {
    "1": [
      {
        "id": "PY1-01",
        "concept": "Use explicit request timeouts and assert the HTTP contract.",
        "text": "import requests\n\nresponse = requests.get(\n    \"http://localhost:8000/health\",\n    timeout=10,\n)\n\nassert response.status_code == 200\nassert response.json()[\"status\"] == \"ok\""
      },
      {
        "id": "PY1-02",
        "concept": "Keep test data readable and assert one clear behavior.",
        "text": "def test_total_is_calculated_correctly():\n    items = [120, 80, 50]\n\n    actual_total = sum(items)\n\n    assert actual_total == 250"
      },
      {
        "id": "PY1-03",
        "concept": "Use pytest parameterization instead of duplicating similar tests.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"username,expected\",\n    [\n        (\"admin\", True),\n        (\"guest\", False),\n        (\"employee02\", True),\n    ],\n)\ndef test_allowed_users(username, expected):\n    assert is_allowed(username) is expected"
      },
      {
        "id": "PY1-04",
        "concept": "Validate both status and essential response fields.",
        "text": "import requests\n\nresponse = requests.post(\n    \"http://localhost:8000/api/login\",\n    json={\"username\": \"employee02\", \"password\": \"Test@123\"},\n    timeout=10,\n)\n\nassert response.status_code == 200\nbody = response.json()\nassert \"token\" in body"
      },
      {
        "id": "PY1-05",
        "concept": "Use pathlib for portable file paths.",
        "text": "from pathlib import Path\n\nreport_dir = Path(\"reports\")\nreport_dir.mkdir(parents=True, exist_ok=True)\n\nresult_file = report_dir / \"smoke_results.txt\"\nresult_file.write_text(\"PASS\n\", encoding=\"utf-8\")"
      },
      {
        "id": "PY1-06",
        "concept": "Use clear assertions with expected values.",
        "text": "def test_ticket_defaults():\n    ticket = create_ticket(\"Login failure\")\n\n    assert ticket[\"status\"] == \"OPEN\"\n    assert ticket[\"priority\"] == \"MEDIUM\"\n    assert ticket[\"title\"] == \"Login failure\""
      }
    ],
    "2": [
      {
        "id": "PY2-01",
        "concept": "Reuse HTTP connections with requests.Session and set common headers once.",
        "text": "import requests\n\nsession = requests.Session()\nsession.headers.update({\"Accept\": \"application/json\"})\n\nresponse = session.get(\n    \"http://localhost:8000/api/tickets\",\n    timeout=10,\n)\n\nresponse.raise_for_status()\ntickets = response.json()\nassert isinstance(tickets, list)"
      },
      {
        "id": "PY2-02",
        "concept": "Use fixtures for reusable setup and cleanup.",
        "text": "import pytest\n\n@pytest.fixture\ndef sample_ticket():\n    ticket = create_ticket(title=\"Printer offline\")\n    yield ticket\n    delete_ticket(ticket[\"id\"])\n\n\ndef test_ticket_can_be_closed(sample_ticket):\n    result = close_ticket(sample_ticket[\"id\"])\n    assert result[\"status\"] == \"CLOSED\""
      },
      {
        "id": "PY2-03",
        "concept": "Read configuration from environment variables, not hardcoded secrets.",
        "text": "import os\n\nBASE_URL = os.environ.get(\"BASE_URL\", \"http://localhost:8000\")\nAPI_TOKEN = os.environ[\"API_TOKEN\"]\n\nheaders = {\n    \"Authorization\": f\"Bearer {API_TOKEN}\",\n    \"Accept\": \"application/json\",\n}\n\nassert headers[\"Authorization\"].startswith(\"Bearer \")"
      },
      {
        "id": "PY2-04",
        "concept": "Log useful test context without hiding assertion failures.",
        "text": "import logging\n\nlogger = logging.getLogger(__name__)\n\n\ndef test_user_profile(api_client):\n    response = api_client.get(\"/api/profile\")\n    logger.info(\"Profile response status=%s\", response.status_code)\n\n    assert response.status_code == 200\n    assert response.json()[\"active\"] is True"
      },
      {
        "id": "PY2-05",
        "concept": "Use temporary paths instead of writing test artifacts into the project root.",
        "text": "def test_export_creates_csv(tmp_path):\n    output_file = tmp_path / \"tickets.csv\"\n\n    export_tickets(output_file)\n\n    assert output_file.exists()\n    content = output_file.read_text(encoding=\"utf-8\")\n    assert \"ticket_id,status\" in content"
      },
      {
        "id": "PY2-06",
        "concept": "Test negative behavior explicitly with pytest.raises.",
        "text": "import pytest\n\n\ndef test_invalid_priority_is_rejected():\n    with pytest.raises(ValueError, match=\"Unsupported priority\"):\n        create_ticket(\n            title=\"Database alert\",\n            priority=\"URGENTEST\",\n        )"
      }
    ],
    "3": [
      {
        "id": "PY3-01",
        "concept": "Create a small API client so tests focus on behavior, not request plumbing.",
        "text": "import requests\n\nclass ApiClient:\n    def __init__(self, base_url, token):\n        self.base_url = base_url.rstrip(\"/\")\n        self.session = requests.Session()\n        self.session.headers.update({\n            \"Authorization\": f\"Bearer {token}\",\n            \"Accept\": \"application/json\",\n        })\n\n    def get_ticket(self, ticket_id):\n        return self.session.get(\n            f\"{self.base_url}/api/tickets/{ticket_id}\",\n            timeout=10,\n        )"
      },
      {
        "id": "PY3-02",
        "concept": "Assert response shape before relying on extracted values.",
        "text": "def test_create_ticket(api_client):\n    response = api_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"VPN unavailable\", \"priority\": \"HIGH\"},\n    )\n\n    assert response.status_code == 201\n    body = response.json()\n    assert isinstance(body.get(\"id\"), int)\n    assert body[\"status\"] == \"OPEN\"\n    assert body[\"priority\"] == \"HIGH\""
      },
      {
        "id": "PY3-03",
        "concept": "Parameterize negative API cases with expected status codes.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"payload,expected_status\",\n    [\n        ({}, 400),\n        ({\"title\": \"\"}, 400),\n        ({\"title\": \"Disk full\", \"priority\": \"INVALID\"}, 422),\n    ],\n)\ndef test_create_ticket_rejects_invalid_payloads(api_client, payload, expected_status):\n    response = api_client.post(\"/api/tickets\", json=payload)\n    assert response.status_code == expected_status"
      },
      {
        "id": "PY3-04",
        "concept": "Use subprocess with argument lists and check=True for test tools.",
        "text": "import subprocess\n\nresult = subprocess.run(\n    [\"python\", \"-m\", \"pytest\", \"tests/test_login.py\", \"-q\"],\n    check=True,\n    capture_output=True,\n    text=True,\n)\n\nassert \"passed\" in result.stdout.lower()"
      },
      {
        "id": "PY3-05",
        "concept": "Separate data loading from assertions and validate required fields.",
        "text": "import json\nfrom pathlib import Path\n\nfixture_path = Path(\"testdata\") / \"users.json\"\nusers = json.loads(fixture_path.read_text(encoding=\"utf-8\"))\n\nrequired = {\"username\", \"role\", \"active\"}\nfor user in users:\n    assert required.issubset(user)\n    assert isinstance(user[\"active\"], bool)"
      },
      {
        "id": "PY3-06",
        "concept": "Use deterministic polling with a deadline instead of arbitrary sleep loops.",
        "text": "import time\n\n\ndef wait_for_status(fetch_status, expected, timeout=10):\n    deadline = time.monotonic() + timeout\n\n    while time.monotonic() < deadline:\n        if fetch_status() == expected:\n            return\n        time.sleep(0.25)\n\n    raise TimeoutError(f\"Status did not become {expected!r}\")"
      }
    ],
    "4": [
      {
        "id": "PY4-01",
        "concept": "Build reusable pytest API fixtures with cleanup and environment-based configuration.",
        "text": "import os\nimport pytest\nimport requests\n\n@pytest.fixture(scope=\"session\")\ndef api_session():\n    base_url = os.environ.get(\"BASE_URL\", \"http://localhost:8000\")\n    token = os.environ[\"API_TOKEN\"]\n\n    session = requests.Session()\n    session.base_url = base_url.rstrip(\"/\")\n    session.headers.update({\n        \"Authorization\": f\"Bearer {token}\",\n        \"Accept\": \"application/json\",\n    })\n\n    yield session\n    session.close()\n\n\ndef test_ticket_lifecycle(api_session):\n    create = api_session.post(\n        f\"{api_session.base_url}/api/tickets\",\n        json={\"title\": \"Email outage\", \"priority\": \"HIGH\"},\n        timeout=10,\n    )\n    assert create.status_code == 201\n    ticket_id = create.json()[\"id\"]\n\n    read = api_session.get(\n        f\"{api_session.base_url}/api/tickets/{ticket_id}\",\n        timeout=10,\n    )\n    assert read.status_code == 200\n    assert read.json()[\"title\"] == \"Email outage\""
      },
      {
        "id": "PY4-02",
        "concept": "Capture diagnostics only when useful, and preserve the original test failure.",
        "text": "import json\nfrom pathlib import Path\n\n\ndef save_failure_artifact(name, response, output_dir=Path(\"artifacts\")):\n    output_dir.mkdir(parents=True, exist_ok=True)\n    artifact = {\n        \"status_code\": response.status_code,\n        \"headers\": dict(response.headers),\n        \"body\": response.text[:5000],\n    }\n\n    path = output_dir / f\"{name}.json\"\n    path.write_text(\n        json.dumps(artifact, indent=2),\n        encoding=\"utf-8\",\n    )\n    return path"
      },
      {
        "id": "PY4-03",
        "concept": "Use precise contract checks for nested response data.",
        "text": "def test_assignment_response(api_client):\n    response = api_client.post(\n        \"/api/tickets/1001/assign\",\n        json={\"owner\": \"employee02\"},\n    )\n\n    assert response.status_code == 200\n    body = response.json()\n\n    assert body[\"ticket\"][\"id\"] == 1001\n    assert body[\"ticket\"][\"owner\"] == \"employee02\"\n    assert body[\"ticket\"][\"status\"] in {\"OPEN\", \"IN_PROGRESS\"}\n    assert body[\"audit\"][\"action\"] == \"ASSIGNED\""
      },
      {
        "id": "PY4-04",
        "concept": "Use factory fixtures to create isolated test data for each scenario.",
        "text": "import pytest\n\n@pytest.fixture\ndef ticket_factory(api_client):\n    created_ids = []\n\n    def create(**overrides):\n        payload = {\n            \"title\": \"Automation test ticket\",\n            \"priority\": \"MEDIUM\",\n            **overrides,\n        }\n        response = api_client.post(\"/api/tickets\", json=payload)\n        assert response.status_code == 201\n        ticket = response.json()\n        created_ids.append(ticket[\"id\"])\n        return ticket\n\n    yield create\n\n    for ticket_id in created_ids:\n        api_client.delete(f\"/api/tickets/{ticket_id}\")"
      },
      {
        "id": "PY4-05",
        "concept": "Keep retries narrowly scoped to eventually consistent state, not assertion failures.",
        "text": "import time\n\n\ndef poll_until(fetch, predicate, timeout=15, interval=0.5):\n    deadline = time.monotonic() + timeout\n    last_value = None\n\n    while time.monotonic() < deadline:\n        last_value = fetch()\n        if predicate(last_value):\n            return last_value\n        time.sleep(interval)\n\n    raise AssertionError(\n        f\"Condition not met within {timeout}s; last value={last_value!r}\"\n    )"
      },
      {
        "id": "PY4-06",
        "concept": "Validate an end-to-end API workflow while keeping assertions close to each action.",
        "text": "def test_restricted_assignment_flow(api_client, employee_client):\n    create = employee_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"Payroll access\", \"priority\": \"HIGH\"},\n    )\n    assert create.status_code == 201\n    ticket_id = create.json()[\"id\"]\n\n    forbidden = employee_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert forbidden.status_code == 403\n\n    allowed = api_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert allowed.status_code == 200\n    assert allowed.json()[\"owner\"] == \"employee03\""
      }
    ]
  },
  "Selenium": {
    "1": [
      {
        "id": "SEL1-01",
        "concept": "Use stable locators and explicit waits for interactive elements.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\nwait = WebDriverWait(driver, 10)\nlogin_button = wait.until(\n    EC.element_to_be_clickable((By.ID, \"login-button\"))\n)\nlogin_button.click()"
      },
      {
        "id": "SEL1-02",
        "concept": "Prefer meaningful IDs or data attributes over brittle absolute XPath.",
        "text": "from selenium.webdriver.common.by import By\n\nusername = driver.find_element(By.ID, \"username\")\npassword = driver.find_element(By.ID, \"password\")\nsubmit = driver.find_element(By.CSS_SELECTOR, \"button[data-testid='login-submit']\")\n\nusername.send_keys(\"employee02\")\npassword.send_keys(\"Test@123\")\nsubmit.click()"
      },
      {
        "id": "SEL1-03",
        "concept": "Assert visible user outcomes, not implementation details.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\n\nmessage = wait.until(\n    EC.visibility_of_element_located((By.CLASS_NAME, \"success-message\"))\n)\n\nassert message.text == \"Ticket created successfully\""
      },
      {
        "id": "SEL1-04",
        "concept": "Use Select for real HTML select elements.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import Select\n\npriority = Select(driver.find_element(By.ID, \"priority\"))\npriority.select_by_visible_text(\"High\")\n\nassert priority.first_selected_option.text == \"High\""
      },
      {
        "id": "SEL1-05",
        "concept": "Wait for navigation conditions instead of sleeping.",
        "text": "from selenium.webdriver.support import expected_conditions as EC\n\nlogin_page.login(\"employee02\", \"Test@123\")\n\nwait.until(EC.url_contains(\"/dashboard\"))\nassert \"/dashboard\" in driver.current_url"
      },
      {
        "id": "SEL1-06",
        "concept": "Keep browser setup explicit and easy to understand.",
        "text": "from selenium import webdriver\n\noptions = webdriver.ChromeOptions()\noptions.add_argument(\"--window-size=1440,900\")\n\ndriver = webdriver.Chrome(options=options)\ndriver.get(\"http://localhost:8080/login\")\nassert driver.title"
      }
    ],
    "2": [
      {
        "id": "SEL2-01",
        "concept": "Encapsulate page behavior in a Page Object.",
        "text": "from selenium.webdriver.common.by import By\n\nclass LoginPage:\n    USERNAME = (By.ID, \"username\")\n    PASSWORD = (By.ID, \"password\")\n    SUBMIT = (By.CSS_SELECTOR, \"button[type='submit']\")\n\n    def __init__(self, driver):\n        self.driver = driver\n\n    def login(self, username, password):\n        self.driver.find_element(*self.USERNAME).send_keys(username)\n        self.driver.find_element(*self.PASSWORD).send_keys(password)\n        self.driver.find_element(*self.SUBMIT).click()"
      },
      {
        "id": "SEL2-02",
        "concept": "Use pytest fixtures so the browser always closes.",
        "text": "import pytest\nfrom selenium import webdriver\n\n@pytest.fixture\ndef driver():\n    browser = webdriver.Chrome()\n    browser.set_window_size(1440, 900)\n    yield browser\n    browser.quit()\n\n\ndef test_home_page_loads(driver):\n    driver.get(\"http://localhost:8080\")\n    assert \"ServiceDesk\" in driver.title"
      },
      {
        "id": "SEL2-03",
        "concept": "Wait for validation messages after submitting invalid data.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\n\nlogin_page.login(\"employee02\", \"wrong-password\")\n\nerror = wait.until(\n    EC.visibility_of_element_located((By.CSS_SELECTOR, \"[role='alert']\"))\n)\n\nassert \"Invalid username or password\" in error.text"
      },
      {
        "id": "SEL2-04",
        "concept": "Use parameterization for repeated browser validation cases.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"username,password\",\n    [\n        (\"\", \"Test@123\"),\n        (\"employee02\", \"\"),\n        (\"unknown\", \"wrong\"),\n    ],\n)\ndef test_invalid_login_cases(driver, username, password):\n    page = LoginPage(driver)\n    page.open()\n    page.login(username, password)\n    assert page.error_message().is_displayed()"
      },
      {
        "id": "SEL2-05",
        "concept": "Wait until a table row is present before reading dynamic content.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\n\nrow = wait.until(\n    EC.presence_of_element_located(\n        (By.CSS_SELECTOR, \"table[data-testid='tickets'] tbody tr\")\n    )\n)\n\nassert row.find_element(By.CSS_SELECTOR, \"td.status\").text == \"OPEN\""
      },
      {
        "id": "SEL2-06",
        "concept": "Capture screenshots with deterministic file names.",
        "text": "from pathlib import Path\n\nartifact_dir = Path(\"artifacts\")\nartifact_dir.mkdir(exist_ok=True)\n\nscreenshot = artifact_dir / \"login_failure.png\"\ndriver.save_screenshot(str(screenshot))\n\nassert screenshot.exists()"
      }
    ],
    "3": [
      {
        "id": "SEL3-01",
        "concept": "Combine Page Objects with explicit waits inside page methods.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\nclass TicketPage:\n    TITLE = (By.ID, \"title\")\n    PRIORITY = (By.ID, \"priority\")\n    SAVE = (By.CSS_SELECTOR, \"button[data-testid='save-ticket']\")\n    SUCCESS = (By.CSS_SELECTOR, \"[role='status']\")\n\n    def __init__(self, driver, timeout=10):\n        self.driver = driver\n        self.wait = WebDriverWait(driver, timeout)\n\n    def create_ticket(self, title):\n        self.wait.until(EC.visibility_of_element_located(self.TITLE)).send_keys(title)\n        self.wait.until(EC.element_to_be_clickable(self.SAVE)).click()\n        return self.wait.until(EC.visibility_of_element_located(self.SUCCESS)).text"
      },
      {
        "id": "SEL3-02",
        "concept": "Use window handles carefully when a workflow opens a new tab, and keep selection logic readable.",
        "text": "original = driver.current_window_handle\nknown_handles = set(driver.window_handles)\n\nreport_link.click()\n\nwait.until(\n    lambda d: len(d.window_handles) == len(known_handles) + 1\n)\nnew_handle = next(\n    handle\n    for handle in driver.window_handles\n    if handle not in known_handles\n)\ndriver.switch_to.window(new_handle)\n\nassert \"Report\" in driver.title\ndriver.close()\ndriver.switch_to.window(original)"
      },
      {
        "id": "SEL3-03",
        "concept": "Use robust conditions for asynchronous loading states.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\n\nspinner = (By.CSS_SELECTOR, \"[data-testid='loading-spinner']\")\nrefresh_button.click()\n\nwait.until(EC.invisibility_of_element_located(spinner))\nrows = driver.find_elements(By.CSS_SELECTOR, \"table tbody tr\")\nassert len(rows) > 0"
      },
      {
        "id": "SEL3-04",
        "concept": "Prefer semantic data-testid locators for application-owned UI.",
        "text": "from selenium.webdriver.common.by import By\n\nclass DashboardPage:\n    OPEN_TICKETS = (By.CSS_SELECTOR, \"[data-testid='open-ticket-count']\")\n    NEW_TICKET = (By.CSS_SELECTOR, \"[data-testid='new-ticket']\")\n\n    def open_ticket_count(self):\n        text = self.driver.find_element(*self.OPEN_TICKETS).text\n        return int(text)\n\n    def click_new_ticket(self):\n        self.driver.find_element(*self.NEW_TICKET).click()"
      },
      {
        "id": "SEL3-05",
        "concept": "Verify sortable-table behavior with readable locators, waits, and visible values.",
        "text": "from selenium.webdriver.common.by import By\n\npriority_header = driver.find_element(\n    By.CSS_SELECTOR,\n    \"th[data-column='priority']\",\n)\npriority_header.click()\n\nwait.until(\n    lambda d: d.find_element(\n        By.CSS_SELECTOR,\n        \"th[data-column='priority']\",\n    ).get_attribute(\"aria-sort\") == \"ascending\"\n)\n\nvalues = [\n    cell.text\n    for cell in driver.find_elements(\n        By.CSS_SELECTOR,\n        \"td[data-column='priority']\",\n    )\n]\nassert values == sorted(values)"
      },
      {
        "id": "SEL3-06",
        "concept": "Keep test logic readable by delegating UI details to page methods.",
        "text": "def test_agent_can_close_assigned_ticket(driver, authenticated_agent):\n    dashboard = DashboardPage(driver)\n    dashboard.open()\n\n    ticket = dashboard.open_first_assigned_ticket()\n    ticket.close_with_resolution(\"Issue verified and resolved\")\n\n    assert ticket.status_text() == \"CLOSED\"\n    assert ticket.resolution_text() == \"Issue verified and resolved\""
      }
    ],
    "4": [
      {
        "id": "SEL4-01",
        "concept": "Use a pytest hook to capture screenshots only for failed UI tests.",
        "text": "from pathlib import Path\nimport pytest\n\n@pytest.hookimpl(hookwrapper=True)\ndef pytest_runtest_makereport(item, call):\n    outcome = yield\n    report = outcome.get_result()\n\n    if report.when != \"call\" or not report.failed:\n        return\n\n    driver = item.funcargs.get(\"driver\")\n    if driver is None:\n        return\n\n    artifact_dir = Path(\"artifacts\")\n    artifact_dir.mkdir(exist_ok=True)\n    driver.save_screenshot(str(artifact_dir / f\"{item.name}.png\"))"
      },
      {
        "id": "SEL4-02",
        "concept": "Model a complete page flow with locators, waits, and clear return values.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import Select, WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\nclass CreateTicketPage:\n    TITLE = (By.ID, \"title\")\n    PRIORITY = (By.ID, \"priority\")\n    DESCRIPTION = (By.ID, \"description\")\n    SUBMIT = (By.CSS_SELECTOR, \"button[data-testid='create-ticket']\")\n    TICKET_ID = (By.CSS_SELECTOR, \"[data-testid='created-ticket-id']\")\n\n    def __init__(self, driver):\n        self.driver = driver\n        self.wait = WebDriverWait(driver, 10)\n\n    def create(self, title, priority, description):\n        title_box = self.wait.until(\n            EC.visibility_of_element_located(self.TITLE)\n        )\n        title_box.send_keys(title)\n\n        priority_select = Select(\n            self.driver.find_element(*self.PRIORITY)\n        )\n        priority_select.select_by_visible_text(priority)\n\n        self.driver.find_element(\n            *self.DESCRIPTION\n        ).send_keys(description)\n\n        self.wait.until(\n            EC.element_to_be_clickable(self.SUBMIT)\n        ).click()\n\n        ticket_id = self.wait.until(\n            EC.visibility_of_element_located(self.TICKET_ID)\n        )\n        return ticket_id.text"
      },
      {
        "id": "SEL4-03",
        "concept": "Use isolated browser state and explicit authentication setup in fixtures.",
        "text": "import pytest\n\n@pytest.fixture\ndef authenticated_driver(driver, base_url):\n    driver.get(f\"{base_url}/login\")\n    login = LoginPage(driver)\n    login.login(\"employee02\", \"Test@123\")\n\n    WebDriverWait(driver, 10).until(\n        lambda d: \"/dashboard\" in d.current_url\n    )\n\n    yield driver\n    driver.delete_all_cookies()"
      },
      {
        "id": "SEL4-04",
        "concept": "Verify restricted access as a user-visible behavior.",
        "text": "def test_employee_cannot_open_admin_page(authenticated_driver, base_url):\n    authenticated_driver.get(f\"{base_url}/admin/users\")\n\n    wait = WebDriverWait(authenticated_driver, 10)\n    alert = wait.until(\n        EC.visibility_of_element_located((By.CSS_SELECTOR, \"[role='alert']\"))\n    )\n\n    assert \"You do not have permission\" in alert.text\n    assert \"/admin/users\" not in authenticated_driver.current_url"
      },
      {
        "id": "SEL4-05",
        "concept": "Use accessible attributes when verifying stateful controls.",
        "text": "def test_filter_panel_expands_and_collapses(driver):\n    toggle = driver.find_element(\n        By.CSS_SELECTOR,\n        \"button[data-testid='filters-toggle']\",\n    )\n\n    toggle.click()\n    wait.until(\n        lambda d: toggle.get_attribute(\"aria-expanded\") == \"true\"\n    )\n    assert driver.find_element(\n        By.ID,\n        \"ticket-filters\",\n    ).is_displayed()\n\n    toggle.click()\n    wait.until(\n        lambda d: toggle.get_attribute(\"aria-expanded\") == \"false\"\n    )"
      },
      {
        "id": "SEL4-06",
        "concept": "Keep end-to-end tests focused on a critical workflow and observable results.",
        "text": "def test_ticket_creation_and_assignment(authenticated_driver):\n    dashboard = DashboardPage(authenticated_driver)\n    dashboard.open()\n\n    create_page = dashboard.open_create_ticket()\n    ticket_id = create_page.create(\n        title=\"Production login failure\",\n        priority=\"High\",\n        description=\"User receives HTTP 500 after authentication.\",\n    )\n\n    ticket_page = TicketPage(authenticated_driver, ticket_id)\n    ticket_page.assign_to(\"Agent Two\")\n\n    assert ticket_page.ticket_id() == ticket_id\n    assert ticket_page.owner_text() == \"Agent Two\"\n    assert ticket_page.status_text() == \"IN_PROGRESS\""
      }
    ]
  },
  "JMeter": {
    "1": [
      {
        "id": "JM1-01",
        "concept": "Run load tests in non-GUI mode and save a JTL result file.",
        "text": "jmeter -n   -t smoke_test.jmx   -l results/smoke.jtl"
      },
      {
        "id": "JM1-02",
        "concept": "Use JMeter properties so workload values can change from a readable PowerShell command.",
        "text": "jmeter -n `\n    -t load_test.jmx `\n    -Jusers=10 `\n    -Jramp=30 `\n    -Jduration=120 `\n    -l results/load.jtl"
      },
      {
        "id": "JM1-03",
        "concept": "Use JMeter variables for correlated values inside requests.",
        "text": "Authorization: Bearer ${access_token}\nContent-Type: application/json\nX-Request-Id: ${request_id}\n\n/api/tickets/${ticket_id}"
      },
      {
        "id": "JM1-04",
        "concept": "Use a JSON Extractor expression that targets the exact field you need.",
        "text": "Variable name: access_token\nJSON Path expression: $.token\nMatch No.: 1\nDefault Value: NOT_FOUND"
      },
      {
        "id": "JM1-05",
        "concept": "Assert expected response codes explicitly, including negative tests.",
        "text": "Response Assertion\nField to Test: Response Code\nPattern Matching Rule: Equals\nPatterns to Test: 403"
      },
      {
        "id": "JM1-06",
        "concept": "Generate the HTML report from the same final JTL file with a readable PowerShell command.",
        "text": "jmeter -n `\n    -t final_regression.jmx `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression"
      }
    ],
    "2": [
      {
        "id": "JM2-01",
        "concept": "Use Groovy in JSR223 elements for efficient scripting.",
        "text": "import groovy.json.JsonSlurper\n\ndef body = prev.getResponseDataAsString()\ndef json = new JsonSlurper().parseText(body)\n\nassert json.id != null : \"Response id is missing\"\nvars.put(\"ticketId\", json.id.toString())"
      },
      {
        "id": "JM2-02",
        "concept": "Fail fast when correlation returns its default value.",
        "text": "def token = vars.get(\"access_token\")\n\nif (!token || token == \"NOT_FOUND\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"access_token was not extracted\")\n}"
      },
      {
        "id": "JM2-03",
        "concept": "Create unique external references instead of reusing fixed test data.",
        "text": "import java.util.UUID\n\ndef externalRef = \"perf-\" + UUID.randomUUID().toString()\nvars.put(\"externalRef\", externalRef)\n\nlog.info(\"Generated externalRef={}\", externalRef)"
      },
      {
        "id": "JM2-04",
        "concept": "Keep per-user correlation in JMeter variables, not global properties.",
        "text": "def ticketId = vars.get(\"ticketId\")\n\ndef payload = \"\"\"{\n  \"ticketId\": ${ticketId},\n  \"status\": \"IN_PROGRESS\"\n}\"\"\"\n\nvars.put(\"updatePayload\", payload)"
      },
      {
        "id": "JM2-05",
        "concept": "Use randomized think time instead of one fixed pause.",
        "text": "Uniform Random Timer\nRandom Delay Maximum: 400\nConstant Delay Offset: 400\n\nEffective delay range: 400 to 800 ms"
      },
      {
        "id": "JM2-06",
        "concept": "Parameterize thread count and duration with __P for command-line control.",
        "text": "Number of Threads: ${__P(users,10)}\nRamp-up Period: ${__P(ramp,30)}\nDuration: ${__P(duration,120)}\n\nLoop Count: Forever\nScheduler: Enabled"
      }
    ],
    "3": [
      {
        "id": "JM3-01",
        "concept": "Validate a JSON response and preserve a correlated ID for later samplers.",
        "text": "import groovy.json.JsonSlurper\n\ndef responseText = prev.getResponseDataAsString()\ndef json = new JsonSlurper().parseText(responseText)\n\nif (prev.getResponseCode() != \"201\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\n        \"Expected 201 but received ${prev.getResponseCode()}\"\n    )\n}\n\nif (!json.id) {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"Created ticket id is missing\")\n} else {\n    vars.put(\"ticketId\", json.id.toString())\n}"
      },
      {
        "id": "JM3-02",
        "concept": "Distinguish an expected 403 negative test from an unexpected failure.",
        "text": "def code = prev.getResponseCode()\ndef body = prev.getResponseDataAsString()\n\nif (code != \"403\") {\n    AssertionResult.setFailure(true)\n\n    def message = \"Restricted assignment expected HTTP 403, \" +\n        \"received ${code}; body=${body}\"\n\n    AssertionResult.setFailureMessage(message)\n}"
      },
      {
        "id": "JM3-03",
        "concept": "Use CSV data for reusable test users and keep variables local to each thread.",
        "text": "CSV Data Set Config\nFilename: data/users.csv\nVariable Names: username,password,role\nDelimiter: ,\nRecycle on EOF: True\nStop thread on EOF: False\nSharing mode: Current thread group"
      },
      {
        "id": "JM3-04",
        "concept": "Use a preprocessor to create a realistic unique request payload.",
        "text": "import groovy.json.JsonOutput\nimport java.util.UUID\n\ndef payload = [\n    title      : \"Load test ${UUID.randomUUID()}\",\n    priority   : \"HIGH\",\n    externalRef: \"jmeter-${UUID.randomUUID()}\"\n]\n\nvars.put(\"requestBody\", JsonOutput.toJson(payload))"
      },
      {
        "id": "JM3-05",
        "concept": "Make the final run reproducible with explicit properties in a readable PowerShell command.",
        "text": "jmeter -n `\n    -t plans/final_regression.jmx `\n    -Jusers=25 `\n    -Jramp=60 `\n    -Jduration=180 `\n    -JbaseUrl=http://localhost:8080 `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression"
      },
      {
        "id": "JM3-06",
        "concept": "Log correlation failures with enough context to diagnose the sampler.",
        "text": "def ticketId = vars.get(\"ticketId\")\n\nif (!ticketId) {\n    log.error(\n        \"ticketId missing after sampler={}, responseCode={}\",\n        prev.getSampleLabel(),\n        prev.getResponseCode()\n    )\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"ticketId correlation failed\")\n}"
      }
    ],
    "4": [
      {
        "id": "JM4-01",
        "concept": "Use JSR223 assertions to classify unexpected server failures precisely.",
        "text": "import groovy.json.JsonSlurper\n\ndef code = prev.getResponseCode()\ndef body = prev.getResponseDataAsString()\n\ndef json = null\ntry {\n    json = new JsonSlurper().parseText(body)\n} catch (ignored) {\n    // Keep raw body for diagnostics when response is not JSON.\n}\n\nif (code != \"200\") {\n    AssertionResult.setFailure(true)\n\n    def detail = json?.error ?: body.take(500)\n    def message = \"Expected HTTP 200, received ${code}; \" +\n        \"error=${detail}\"\n\n    AssertionResult.setFailureMessage(message)\n}\n\nif (code == \"200\" && json?.status != \"OPEN\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\n        \"Expected status OPEN, received ${json?.status}\"\n    )\n}"
      },
      {
        "id": "JM4-02",
        "concept": "Keep staged workload settings explicit so each phase is reproducible.",
        "text": "Stage 1: users=5,  ramp=30, duration=120\nStage 2: users=10, ramp=30, duration=120\nStage 3: users=25, ramp=60, duration=180\nStage 4: users=40, ramp=60, duration=180\nStage 5: users=5,  ramp=30, duration=120\n\nPacing: Uniform Random Timer, 400 to 800 ms\nResults: one clean JTL per stage plus one final regression JTL"
      },
      {
        "id": "JM4-03",
        "concept": "Create thread-safe unique business data without using global mutable properties.",
        "text": "import groovy.json.JsonOutput\nimport java.util.UUID\n\nString user = vars.get(\"username\") ?: \"anonymous\"\nString ref = \"${user}-${UUID.randomUUID()}\"\n\ndef body = [\n    title      : \"Performance validation\",\n    priority   : \"HIGH\",\n    externalRef: ref\n]\n\nvars.put(\"externalRef\", ref)\nvars.put(\"requestBody\", JsonOutput.toJson(body))"
      },
      {
        "id": "JM4-04",
        "concept": "Check both ownership and asset correlation after extracting dependent IDs.",
        "text": "def ticketId = vars.get(\"ticketId\")\ndef ownerId = vars.get(\"ownerId\")\ndef assetId = vars.get(\"assetId\")\n\n[\n    ticketId: ticketId,\n    ownerId : ownerId,\n    assetId : assetId,\n].each { name, value ->\n    if (!value || value == \"NOT_FOUND\") {\n        AssertionResult.setFailure(true)\n        AssertionResult.setFailureMessage(\"${name} correlation failed\")\n    }\n}"
      },
      {
        "id": "JM4-05",
        "concept": "Run baseline and final regression separately with readable PowerShell commands.",
        "text": "New-Item -ItemType Directory -Force results, reports\n\njmeter -n `\n    -t plans/baseline.jmx `\n    -l results/baseline.jtl `\n    -e `\n    -o reports/baseline\n\njmeter -n `\n    -t plans/final_regression.jmx `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression"
      },
      {
        "id": "JM4-06",
        "concept": "Validate a chained create-read-update flow while keeping correlation thread-local.",
        "text": "// After CREATE sampler\nimport groovy.json.JsonSlurper\n\ndef created = new JsonSlurper().parseText(prev.getResponseDataAsString())\nassert prev.getResponseCode() == \"201\"\nassert created.id != null\nvars.put(\"ticketId\", created.id.toString())\n\n// Later samplers use ${ticketId}; do not copy it into a global property.\n// READ should return 200 before UPDATE is attempted.\n// UPDATE should assert both HTTP status and the changed business field."
      }
    ]
  },
  "Postman": {
    "1": [
      {
        "id": "PM1-01",
        "concept": "Assert the response status with a named Postman test.",
        "text": "pm.test(\"Status code is 200\", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test(\"Response is JSON\", function () {\n    pm.response.to.be.json;\n});"
      },
      {
        "id": "PM1-02",
        "concept": "Parse the response once and reuse the parsed object.",
        "text": "const body = pm.response.json();\n\npm.test(\"Ticket is open\", function () {\n    pm.expect(body.status).to.eql(\"OPEN\");\n    pm.expect(body.priority).to.eql(\"HIGH\");\n});"
      },
      {
        "id": "PM1-03",
        "concept": "Store extracted values only after validating they exist.",
        "text": "const body = pm.response.json();\n\npm.test(\"Token is returned\", function () {\n    pm.expect(body.token).to.be.a(\"string\").and.not.empty;\n});\n\npm.environment.set(\"accessToken\", body.token);"
      },
      {
        "id": "PM1-04",
        "concept": "Use collection or environment variables instead of hardcoded URLs.",
        "text": "const baseUrl = pm.environment.get(\"baseUrl\");\n\npm.test(\"Base URL is configured\", function () {\n    pm.expect(baseUrl).to.be.a(\"string\");\n    pm.expect(baseUrl).to.match(/^https?:\\/\\//);\n});"
      },
      {
        "id": "PM1-05",
        "concept": "Assert important response headers when they are part of the contract.",
        "text": "pm.test(\"Content-Type is JSON\", function () {\n    pm.expect(pm.response.headers.get(\"Content-Type\"))\n        .to.include(\"application/json\");\n});"
      },
      {
        "id": "PM1-06",
        "concept": "Use a clear negative test for authentication failure.",
        "text": "pm.test(\"Invalid credentials are rejected\", function () {\n    pm.response.to.have.status(401);\n});\n\nconst body = pm.response.json();\npm.expect(body.error).to.eql(\"INVALID_CREDENTIALS\");"
      }
    ],
    "2": [
      {
        "id": "PM2-01",
        "concept": "Validate status, structure, and correlation in one focused script.",
        "text": "const body = pm.response.json();\n\npm.test(\"Ticket was created\", function () {\n    pm.response.to.have.status(201);\n    pm.expect(body.id).to.be.a(\"number\");\n    pm.expect(body.status).to.eql(\"OPEN\");\n});\n\npm.environment.set(\"ticketId\", String(body.id));"
      },
      {
        "id": "PM2-02",
        "concept": "Use pre-request variables to generate unique test data.",
        "text": "const uniqueRef = pm.variables.replaceIn(\"{{$guid}}\");\nconst title = `Postman ticket ${uniqueRef}`;\n\npm.variables.set(\"externalRef\", uniqueRef);\npm.variables.set(\"ticketTitle\", title);\n\npm.test(\"Generated data is available\", function () {\n    pm.expect(pm.variables.get(\"externalRef\")).to.not.be.empty;\n});"
      },
      {
        "id": "PM2-03",
        "concept": "Parameterize requests with data variables during Collection Runner or Newman runs.",
        "text": "const username = pm.iterationData.get(\"username\");\nconst expectedStatus = Number(pm.iterationData.get(\"expectedStatus\"));\n\npm.test(`Login status for ${username}`, function () {\n    pm.expect(pm.response.code).to.eql(expectedStatus);\n});"
      },
      {
        "id": "PM2-04",
        "concept": "Validate arrays and required object properties explicitly.",
        "text": "const body = pm.response.json();\n\npm.test(\"Ticket list has expected shape\", function () {\n    pm.expect(body.items).to.be.an(\"array\");\n    body.items.forEach((ticket) => {\n        pm.expect(ticket).to.include.keys(\"id\", \"title\", \"status\");\n    });\n});"
      },
      {
        "id": "PM2-05",
        "concept": "Keep expected negative responses as passing tests when behavior is correct.",
        "text": "pm.test(\"Employee cannot assign restricted ticket\", function () {\n    pm.expect(pm.response.code).to.eql(403);\n});\n\nconst body = pm.response.json();\npm.expect(body.error).to.eql(\"FORBIDDEN\");"
      },
      {
        "id": "PM2-06",
        "concept": "Run Newman with environment data and a machine-readable report using readable PowerShell continuation.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    --reporters cli,json `\n    --reporter-json-export reports/newman-results.json"
      }
    ],
    "3": [
      {
        "id": "PM3-01",
        "concept": "Validate an API response against a JSON Schema.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"id\", \"title\", \"status\"],\n    properties: {\n        id: { type: \"integer\" },\n        title: { type: \"string\", minLength: 1 },\n        status: { enum: [\"OPEN\", \"IN_PROGRESS\", \"CLOSED\"] }\n    }\n};\n\npm.test(\"Ticket contract is valid\", function () {\n    pm.response.to.have.jsonSchema(schema);\n});"
      },
      {
        "id": "PM3-02",
        "concept": "Fail clearly when a prerequisite environment variable is missing.",
        "text": "const token = pm.environment.get(\"accessToken\");\n\nif (!token) {\n    throw new Error(\"accessToken is not configured; run the login request first\");\n}\n\npm.request.headers.upsert({\n    key: \"Authorization\",\n    value: `Bearer ${token}`\n});"
      },
      {
        "id": "PM3-03",
        "concept": "Correlate a created ID and verify it before saving it.",
        "text": "const body = pm.response.json();\n\npm.test(\"Created ticket has a usable id\", function () {\n    pm.response.to.have.status(201);\n    pm.expect(body.id).to.be.a(\"number\");\n    pm.expect(body.id).to.be.above(0);\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));"
      },
      {
        "id": "PM3-04",
        "concept": "Validate pagination metadata and returned item count consistently.",
        "text": "const body = pm.response.json();\n\npm.test(\"Pagination metadata is consistent\", function () {\n    pm.expect(body.page).to.be.a(\"number\");\n    pm.expect(body.pageSize).to.be.a(\"number\");\n    pm.expect(body.items).to.be.an(\"array\");\n    pm.expect(body.items.length).to.be.at.most(body.pageSize);\n});"
      },
      {
        "id": "PM3-05",
        "concept": "Assert both authorization result and error semantics for negative access tests.",
        "text": "const body = pm.response.json();\n\npm.test(\"Restricted endpoint blocks employee role\", function () {\n    pm.response.to.have.status(403);\n    pm.expect(body.code).to.eql(\"FORBIDDEN\");\n    pm.expect(body.message).to.include(\"permission\");\n});"
      },
      {
        "id": "PM3-06",
        "concept": "Fail a CI-style Newman run on test failure and export JUnit output in readable PowerShell.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    --bail failure `\n    --reporters cli,junit `\n    --reporter-junit-export reports/newman-junit.xml"
      }
    ],
    "4": [
      {
        "id": "PM4-01",
        "concept": "Build layered assertions so failures identify the broken part of the API contract.",
        "text": "const body = pm.response.json();\n\npm.test(\"Create ticket returns HTTP 201\", function () {\n    pm.response.to.have.status(201);\n});\n\npm.test(\"Created ticket contains required fields\", function () {\n    pm.expect(body).to.include.keys(\n        \"id\",\n        \"title\",\n        \"priority\",\n        \"status\",\n        \"createdAt\"\n    );\n});\n\npm.test(\"Created ticket values are correct\", function () {\n    pm.expect(body.title).to.eql(pm.variables.get(\"ticketTitle\"));\n    pm.expect(body.priority).to.eql(\"HIGH\");\n    pm.expect(body.status).to.eql(\"OPEN\");\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));"
      },
      {
        "id": "PM4-02",
        "concept": "Use collection variables for workflow state and environment variables for environment configuration.",
        "text": "const baseUrl = pm.environment.get(\"baseUrl\");\nconst token = pm.environment.get(\"accessToken\");\nconst ticketId = pm.collectionVariables.get(\"ticketId\");\n\nif (!baseUrl) {\n    throw new Error(\"baseUrl environment variable is missing\");\n}\n\nif (!token) {\n    throw new Error(\"accessToken environment variable is missing\");\n}\n\nif (!ticketId) {\n    throw new Error(\"ticketId collection variable is missing\");\n}"
      },
      {
        "id": "PM4-03",
        "concept": "Verify an update by checking both response values and unchanged identity fields.",
        "text": "const body = pm.response.json();\nconst expectedId = Number(pm.collectionVariables.get(\"ticketId\"));\n\npm.test(\"Ticket update succeeded\", function () {\n    pm.response.to.have.status(200);\n    pm.expect(body.id).to.eql(expectedId);\n    pm.expect(body.status).to.eql(\"IN_PROGRESS\");\n    pm.expect(body.owner).to.eql(\"employee02\");\n});\n\npm.test(\"Update timestamp is present\", function () {\n    pm.expect(body.updatedAt).to.be.a(\"string\").and.not.empty;\n});"
      },
      {
        "id": "PM4-04",
        "concept": "Use a schema to protect against silent contract regressions in nested responses.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"ticket\", \"audit\"],\n    properties: {\n        ticket: {\n            type: \"object\",\n            required: [\"id\", \"owner\", \"status\"],\n            properties: {\n                id: { type: \"integer\" },\n                owner: { type: \"string\" },\n                status: { type: \"string\" }\n            }\n        },\n        audit: {\n            type: \"object\",\n            required: [\"action\", \"timestamp\"]\n        }\n    }\n};\n\npm.test(\"Assignment contract is valid\", function () {\n    pm.response.to.have.jsonSchema(schema);\n});"
      },
      {
        "id": "PM4-05",
        "concept": "Design a negative test that proves the system rejected the operation for the right reason.",
        "text": "const body = pm.response.json();\n\npm.test(\"Restricted assignment is rejected\", function () {\n    pm.response.to.have.status(403);\n    pm.expect(body.code).to.eql(\"FORBIDDEN\");\n});\n\npm.test(\"No success payload is returned\", function () {\n    pm.expect(body).to.not.have.property(\"assignedTicket\");\n    pm.expect(body.message).to.match(/not authorized|permission/i);\n});"
      },
      {
        "id": "PM4-06",
        "concept": "Run a repeatable Newman regression with data, environment, and machine-readable reports in PowerShell.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    -d testdata/regression_users.csv `\n    --iteration-count 1 `\n    --bail failure `\n    --reporters cli,json,junit `\n    --reporter-json-export reports/newman-results.json `\n    --reporter-junit-export reports/newman-junit.xml"
      }
    ]
  },
  "Mixed Testing": {
    "1": [
      {
        "id": "MIX1-01",
        "concept": "Practice a clean pytest API smoke test.",
        "text": "import requests\n\nresponse = requests.get(\"http://localhost:8080/health\", timeout=10)\n\nassert response.status_code == 200\nassert response.json()[\"status\"] == \"ok\""
      },
      {
        "id": "MIX1-02",
        "concept": "Practice a Selenium explicit wait.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\n\nbutton = wait.until(\n    EC.element_to_be_clickable((By.ID, \"submit-ticket\"))\n)\nbutton.click()"
      },
      {
        "id": "MIX1-03",
        "concept": "Practice a Postman status and field assertion.",
        "text": "const body = pm.response.json();\n\npm.test(\"Request succeeded\", function () {\n    pm.response.to.have.status(200);\n    pm.expect(body.status).to.eql(\"OPEN\");\n});"
      },
      {
        "id": "MIX1-04",
        "concept": "Practice a JMeter non-GUI execution command.",
        "text": "jmeter -n   -t plans/smoke.jmx   -l results/smoke.jtl   -e -o reports/smoke"
      },
      {
        "id": "MIX1-05",
        "concept": "Practice safe extraction in Python.",
        "text": "body = response.json()\n\nticket_id = body.get(\"id\")\nassert ticket_id is not None\nassert isinstance(ticket_id, int)"
      },
      {
        "id": "MIX1-06",
        "concept": "Practice Postman environment-variable access.",
        "text": "const baseUrl = pm.environment.get(\"baseUrl\");\n\nif (!baseUrl) {\n    throw new Error(\"baseUrl is not configured\");\n}"
      }
    ],
    "2": [
      {
        "id": "MIX2-01",
        "concept": "Compare how Python validates an API response and extracted value.",
        "text": "response = api_client.post(\n    \"/api/login\",\n    json={\"username\": \"employee02\", \"password\": \"Test@123\"},\n)\n\nassert response.status_code == 200\nbody = response.json()\nassert body.get(\"token\")"
      },
      {
        "id": "MIX2-02",
        "concept": "Practice a Selenium Page Object method with a wait.",
        "text": "def submit(self):\n    button = self.wait.until(\n        EC.element_to_be_clickable(self.SUBMIT_BUTTON)\n    )\n    button.click()\n\n    return self.wait.until(\n        EC.visibility_of_element_located(self.SUCCESS_MESSAGE)\n    ).text"
      },
      {
        "id": "MIX2-03",
        "concept": "Practice JMeter correlation and validation together.",
        "text": "def id = vars.get(\"ticketId\")\n\nif (!id || id == \"NOT_FOUND\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"ticketId correlation failed\")\n}"
      },
      {
        "id": "MIX2-04",
        "concept": "Practice a Postman negative authorization test.",
        "text": "const body = pm.response.json();\n\npm.test(\"Restricted request is blocked\", function () {\n    pm.response.to.have.status(403);\n    pm.expect(body.code).to.eql(\"FORBIDDEN\");\n});"
      },
      {
        "id": "MIX2-05",
        "concept": "Practice pytest parameterization for login outcomes.",
        "text": "@pytest.mark.parametrize(\n    \"username,password,expected\",\n    [\n        (\"employee02\", \"Test@123\", 200),\n        (\"employee02\", \"wrong\", 401),\n    ],\n)\ndef test_login(api_client, username, password, expected):\n    response = api_client.login(username, password)\n    assert response.status_code == expected"
      },
      {
        "id": "MIX2-06",
        "concept": "Practice a reproducible Newman run with readable PowerShell continuation.",
        "text": "newman run API.postman_collection.json `\n    -e QA.postman_environment.json `\n    --reporters cli,junit `\n    --reporter-junit-export reports/api.xml"
      }
    ],
    "3": [
      {
        "id": "MIX3-01",
        "concept": "Practice a realistic pytest API workflow.",
        "text": "def test_create_and_read_ticket(api_client):\n    created = api_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"VPN issue\", \"priority\": \"HIGH\"},\n    )\n    assert created.status_code == 201\n    ticket_id = created.json()[\"id\"]\n\n    fetched = api_client.get(f\"/api/tickets/{ticket_id}\")\n    assert fetched.status_code == 200\n    assert fetched.json()[\"id\"] == ticket_id"
      },
      {
        "id": "MIX3-02",
        "concept": "Practice a Selenium table verification without fixed sleeps.",
        "text": "wait.until(EC.invisibility_of_element_located((By.ID, \"loading\")))\n\nrows = driver.find_elements(By.CSS_SELECTOR, \"table tbody tr\")\nassert rows\n\nstatuses = [\n    row.find_element(By.CSS_SELECTOR, \"td.status\").text\n    for row in rows\n]\nassert \"OPEN\" in statuses"
      },
      {
        "id": "MIX3-03",
        "concept": "Practice a JMeter unique payload with Groovy.",
        "text": "import groovy.json.JsonOutput\nimport java.util.UUID\n\ndef ref = UUID.randomUUID().toString()\ndef body = [title: \"Load test\", externalRef: ref]\n\nvars.put(\"externalRef\", ref)\nvars.put(\"requestBody\", JsonOutput.toJson(body))"
      },
      {
        "id": "MIX3-04",
        "concept": "Practice a Postman schema check.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"id\", \"status\"],\n    properties: {\n        id: { type: \"integer\" },\n        status: { type: \"string\" }\n    }\n};\n\npm.test(\"Contract is valid\", function () {\n    pm.response.to.have.jsonSchema(schema);\n});"
      },
      {
        "id": "MIX3-05",
        "concept": "Practice a Selenium failure artifact pattern.",
        "text": "from pathlib import Path\n\nartifact_dir = Path(\"artifacts\")\nartifact_dir.mkdir(exist_ok=True)\n\nif \"error\" in driver.page_source.lower():\n    driver.save_screenshot(str(artifact_dir / \"unexpected_error.png\"))"
      },
      {
        "id": "MIX3-06",
        "concept": "Practice a parameterized JMeter run that can be repeated exactly from PowerShell.",
        "text": "jmeter -n `\n    -t plans/load_test.jmx `\n    -Jusers=25 `\n    -Jramp=60 `\n    -Jduration=180 `\n    -l results/load_25_users.jtl"
      }
    ],
    "4": [
      {
        "id": "MIX4-01",
        "concept": "Practice a full API test with setup, contract checks, and negative authorization.",
        "text": "def test_assignment_permissions(admin_client, employee_client):\n    created = employee_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"Payroll failure\", \"priority\": \"HIGH\"},\n    )\n    assert created.status_code == 201\n    ticket_id = created.json()[\"id\"]\n\n    denied = employee_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert denied.status_code == 403\n\n    allowed = admin_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert allowed.status_code == 200\n    assert allowed.json()[\"owner\"] == \"employee03\""
      },
      {
        "id": "MIX4-02",
        "concept": "Practice a Page Object workflow with stable locators and explicit waits.",
        "text": "class TicketDetailsPage:\n    ASSIGN_BUTTON = (By.CSS_SELECTOR, \"[data-testid='assign-ticket']\")\n    OWNER_SELECT = (By.ID, \"owner\")\n    SAVE_BUTTON = (By.CSS_SELECTOR, \"[data-testid='save-assignment']\")\n    OWNER_VALUE = (By.CSS_SELECTOR, \"[data-testid='ticket-owner']\")\n\n    def assign_to(self, owner_name):\n        assign_button = self.wait.until(\n            EC.element_to_be_clickable(self.ASSIGN_BUTTON)\n        )\n        assign_button.click()\n\n        owner_select = Select(\n            self.driver.find_element(*self.OWNER_SELECT)\n        )\n        owner_select.select_by_visible_text(owner_name)\n\n        self.driver.find_element(*self.SAVE_BUTTON).click()\n        self.wait.until(\n            EC.text_to_be_present_in_element(\n                self.OWNER_VALUE,\n                owner_name,\n            )\n        )"
      },
      {
        "id": "MIX4-03",
        "concept": "Practice a defensive JMeter assertion for expected and unexpected outcomes.",
        "text": "def code = prev.getResponseCode()\ndef body = prev.getResponseDataAsString()\ndef expected = vars.get(\"expectedStatus\") ?: \"200\"\n\nif (code != expected) {\n    AssertionResult.setFailure(true)\n\n    def sampler = prev.getSampleLabel()\n    def detail = body.take(300)\n    def message = \"Expected HTTP ${expected}, received ${code}; \" +\n        \"sampler=${sampler}; body=${detail}\"\n\n    AssertionResult.setFailureMessage(message)\n}"
      },
      {
        "id": "MIX4-04",
        "concept": "Practice a complete Postman create-and-correlate script.",
        "text": "const body = pm.response.json();\n\npm.test(\"Create request is successful\", function () {\n    pm.response.to.have.status(201);\n});\n\npm.test(\"Created resource is usable\", function () {\n    pm.expect(body.id).to.be.a(\"number\").and.above(0);\n    pm.expect(body.status).to.eql(\"OPEN\");\n    pm.expect(body.title).to.eql(pm.variables.get(\"ticketTitle\"));\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));"
      },
      {
        "id": "MIX4-05",
        "concept": "Practice a clean regression execution sequence with readable commands across tools.",
        "text": "python -m pytest tests/api -q\npython -m pytest tests/ui -q\n\nnewman run API.postman_collection.json `\n    -e QA.postman_environment.json `\n    --bail failure\n\njmeter -n `\n    -t plans/final_regression.jmx `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression"
      },
      {
        "id": "MIX4-06",
        "concept": "Practice evidence-oriented automation that preserves clear failure signals.",
        "text": "def test_ticket_state_matches_ui(api_client, authenticated_driver, ticket_id):\n    api_response = api_client.get(f\"/api/tickets/{ticket_id}\")\n    assert api_response.status_code == 200\n    api_ticket = api_response.json()\n\n    page = TicketPage(authenticated_driver, ticket_id)\n    page.open()\n\n    assert page.status_text() == api_ticket[\"status\"]\n    assert page.owner_text() == api_ticket[\"owner\"]\n    assert page.title_text() == api_ticket[\"title\"]"
      }
    ]
  },
  "Right-Hand QA Focus": {
    "1": [
      {
        "id": "RH1-01",
        "concept": "Right-hand symbol practice using a real Postman assertion.",
        "text": "pm.test(\"Status is OK\", function () {\n    pm.response.to.have.status(200);\n});"
      },
      {
        "id": "RH1-02",
        "concept": "Right-hand bracket practice using a Python API assertion.",
        "text": "body = response.json()\n\nassert body[\"status\"] == \"OPEN\"\nassert body[\"priority\"] == \"HIGH\""
      },
      {
        "id": "RH1-03",
        "concept": "Right-hand punctuation practice with a JMeter variable.",
        "text": "def ticketId = vars.get(\"ticketId\")\nassert ticketId != null"
      },
      {
        "id": "RH1-04",
        "concept": "Right-hand punctuation practice with a Selenium locator.",
        "text": "button = driver.find_element(\n    By.CSS_SELECTOR,\n    \"button[data-testid='login']\",\n)\nbutton.click()"
      },
      {
        "id": "RH1-05",
        "concept": "Right-hand number-row practice with an API timeout.",
        "text": "response = requests.get(\n    \"http://localhost:8080/health\",\n    timeout=10,\n)\nassert response.status_code == 200"
      },
      {
        "id": "RH1-06",
        "concept": "Right-hand braces practice with a Postman response object.",
        "text": "const body = pm.response.json();\n\npm.expect(body.id).to.be.above(0);\npm.expect(body.owner).to.eql(\"employee02\");"
      }
    ],
    "2": [
      {
        "id": "RH2-01",
        "concept": "Practice brackets, quotes, and periods in a realistic Postman check.",
        "text": "const body = pm.response.json();\n\npm.test(\"Priority is HIGH\", function () {\n    pm.expect(body.priority).to.eql(\"HIGH\");\n    pm.expect(body.status).to.eql(\"OPEN\");\n});"
      },
      {
        "id": "RH2-02",
        "concept": "Practice parentheses and selectors with an explicit Selenium wait.",
        "text": "message = wait.until(\n    EC.visibility_of_element_located(\n        (By.CSS_SELECTOR, \"[role='status']\")\n    )\n)\nassert message.text == \"Updated\""
      },
      {
        "id": "RH2-03",
        "concept": "Practice Groovy maps and JMeter variables.",
        "text": "def values = [\n    ticketId: vars.get(\"ticketId\"),\n    ownerId : vars.get(\"ownerId\"),\n]\n\nassert values.ticketId\nassert values.ownerId"
      },
      {
        "id": "RH2-04",
        "concept": "Practice Python dictionary indexing with clear assertions.",
        "text": "result = response.json()\n\nassert result[\"id\"] > 0\nassert result[\"owner\"] == \"employee02\"\nassert result[\"status\"] in {\"OPEN\", \"IN_PROGRESS\"}"
      },
      {
        "id": "RH2-05",
        "concept": "Practice a symbol-heavy Newman command with readable PowerShell continuation.",
        "text": "newman run API.postman_collection.json `\n    -e QA.postman_environment.json `\n    --reporters cli,json `\n    --reporter-json-export reports/result.json"
      },
      {
        "id": "RH2-06",
        "concept": "Practice JMeter CLI properties and paths.",
        "text": "jmeter -n   -t plans/load.jmx   -Jusers=20   -Jduration=120   -l results/load.jtl"
      }
    ],
    "3": [
      {
        "id": "RH3-01",
        "concept": "Practice right-hand-heavy Postman correlation code.",
        "text": "const body = pm.response.json();\n\npm.test(\"Created id is valid\", function () {\n    pm.response.to.have.status(201);\n    pm.expect(body.id).to.be.a(\"number\").and.above(0);\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));"
      },
      {
        "id": "RH3-02",
        "concept": "Practice nested Selenium locators and expected conditions.",
        "text": "row = wait.until(\n    EC.visibility_of_element_located(\n        (By.CSS_SELECTOR, \"table[data-testid='tickets'] tbody tr\")\n    )\n)\n\nstatus = row.find_element(By.CSS_SELECTOR, \"td.status\").text\nassert status in {\"OPEN\", \"CLOSED\"}"
      },
      {
        "id": "RH3-03",
        "concept": "Practice JMeter Groovy assertions with detailed messages.",
        "text": "def code = prev.getResponseCode()\n\nif (code != \"200\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\n        \"Expected 200, received ${code}\"\n    )\n}"
      },
      {
        "id": "RH3-04",
        "concept": "Practice Python formatted strings and response validation.",
        "text": "response = api_client.get(f\"/api/tickets/{ticket_id}\")\n\nassert response.status_code == 200\nbody = response.json()\nassert body[\"id\"] == ticket_id\nassert body[\"owner\"] == \"employee02\""
      },
      {
        "id": "RH3-05",
        "concept": "Practice Postman schema syntax with nested braces.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"id\", \"status\"],\n    properties: {\n        id: { type: \"integer\" },\n        status: { type: \"string\" }\n    }\n};\n\npm.response.to.have.jsonSchema(schema);"
      },
      {
        "id": "RH3-06",
        "concept": "Practice a JMeter unique-reference script with punctuation and method calls.",
        "text": "import java.util.UUID\n\ndef ref = \"load-\" + UUID.randomUUID().toString()\nvars.put(\"externalRef\", ref)\n\nlog.info(\"externalRef={}\", ref)"
      }
    ],
    "4": [
      {
        "id": "RH4-01",
        "concept": "Long right-hand-focused Postman workflow with best-practice assertions.",
        "text": "const body = pm.response.json();\n\npm.test(\"Assignment succeeded\", function () {\n    pm.response.to.have.status(200);\n    pm.expect(body.ticket.id).to.be.a(\"number\").and.above(0);\n    pm.expect(body.ticket.owner).to.eql(\"employee02\");\n    pm.expect(body.ticket.status).to.eql(\"IN_PROGRESS\");\n});\n\npm.test(\"Audit information exists\", function () {\n    pm.expect(body.audit).to.be.an(\"object\");\n    pm.expect(body.audit.action).to.eql(\"ASSIGNED\");\n    pm.expect(body.audit.timestamp).to.be.a(\"string\").and.not.empty;\n});"
      },
      {
        "id": "RH4-02",
        "concept": "Long right-hand-focused Selenium Page Object method.",
        "text": "def assign_to(self, owner_name):\n    self.wait.until(\n        EC.element_to_be_clickable(self.ASSIGN_BUTTON)\n    ).click()\n\n    owner = Select(\n        self.driver.find_element(*self.OWNER_SELECT)\n    )\n    owner.select_by_visible_text(owner_name)\n\n    self.driver.find_element(*self.SAVE_BUTTON).click()\n\n    self.wait.until(\n        EC.text_to_be_present_in_element(\n            self.OWNER_VALUE,\n            owner_name,\n        )\n    )"
      },
      {
        "id": "RH4-03",
        "concept": "Long right-hand-focused JMeter validation script.",
        "text": "import groovy.json.JsonSlurper\n\ndef text = prev.getResponseDataAsString()\ndef json = new JsonSlurper().parseText(text)\n\ndef checks = [\n    id      : json.id,\n    owner   : json.owner,\n    priority: json.priority,\n]\n\nchecks.each { key, value ->\n    if (value == null) {\n        AssertionResult.setFailure(true)\n        AssertionResult.setFailureMessage(\"Missing response field: ${key}\")\n    }\n}"
      },
      {
        "id": "RH4-04",
        "concept": "Long right-hand-focused Python API verification.",
        "text": "def test_ticket_owner_and_priority(api_client, ticket_id):\n    response = api_client.get(f\"/api/tickets/{ticket_id}\")\n\n    assert response.status_code == 200\n    body = response.json()\n\n    assert body[\"id\"] == ticket_id\n    assert body[\"owner\"] == \"employee02\"\n    assert body[\"priority\"] in {\"HIGH\", \"MEDIUM\", \"LOW\"}\n    assert body[\"status\"] in {\"OPEN\", \"IN_PROGRESS\", \"CLOSED\"}"
      },
      {
        "id": "RH4-05",
        "concept": "Long symbol practice using a readable and reproducible Newman PowerShell command.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    -d testdata/users.csv `\n    --bail failure `\n    --reporters cli,json,junit `\n    --reporter-json-export reports/results.json `\n    --reporter-junit-export reports/results.xml"
      },
      {
        "id": "RH4-06",
        "concept": "Long symbol practice using a readable parameterized JMeter PowerShell command.",
        "text": "jmeter -n `\n    -t plans/final_regression.jmx `\n    -Jusers=40 `\n    -Jramp=60 `\n    -Jduration=180 `\n    -JbaseUrl=http://localhost:8080 `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression"
      }
    ]
  }
};

window.TESTING_TIPS = [
  "Use explicit waits in Selenium. Avoid fixed sleep calls because they make UI tests slower and flaky.",
  "In Python API tests, always set a request timeout so a failed service cannot hang the test indefinitely.",
  "Validate a value before storing it for correlation. A missing token or ID should fail at the point of extraction.",
  "Keep JMeter correlation values in vars when they belong to one virtual user. Global properties can leak data across threads.",
  "Run JMeter load tests in non-GUI mode. Use the GUI to build and debug, not for the final load execution.",
  "Use pytest fixtures for setup and cleanup. Tests should not depend on data left behind by an earlier test.",
  "Prefer stable Selenium locators such as IDs or data-testid attributes over absolute XPath expressions.",
  "In Postman, parse pm.response.json() once and reuse the object instead of parsing the same response repeatedly.",
  "A negative test passes when the system rejects the operation exactly as required, for example an expected HTTP 403.",
  "Keep assertions close to the action they validate. This makes failures easier to diagnose.",
  "Parameterize repeated test cases rather than copying the same test logic with different data.",
  "Use environment variables for secrets and environment-specific URLs. Do not hardcode credentials in test code.",
  "Generate unique test data when the SUT requires unique identifiers. UUIDs are safer than fixed values in repeated runs.",
  "Separate baseline and final JMeter result files. Mixing multiple runs in one JTL weakens the evidence.",
  "Use machine-readable Newman reports in addition to CLI output when results need to be archived or consumed by CI.",
  "A good Page Object exposes user actions and outcomes, not every low-level WebDriver call to the test.",
  "Do not retry ordinary assertion failures. Retry only narrowly defined eventually consistent state when the product behavior requires it.",
  "When typing code, accuracy on brackets, quotes, dots, and underscores matters as much as letter accuracy.",
  "If a right-hand symbol repeatedly causes errors, slow down only for that transition and keep the rest of the line steady.",
  "Read the learning focus before typing. The goal is to reinforce a testing pattern while building keyboard accuracy."
];
