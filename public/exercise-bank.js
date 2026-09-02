window.TESTING_DRILLS = {
  "Python Automation": {
    "1": [
      {
        "id": "PY1-01",
        "concept": "Use explicit request timeouts and assert the HTTP contract.",
        "text": "import os\nimport requests\n\nbase_url = os.environ[\"BASE_URL\"].rstrip(\"/\")\nresponse = requests.get(\n    f\"{base_url}/health\",\n    timeout=10,\n)\n\nassert response.status_code == 200\nassert response.json()[\"status\"] == \"ok\"",
        "lesson": "Why this matters: Use explicit request timeouts and assert the HTTP contract. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY1-02",
        "concept": "Keep test data readable and assert one clear behavior.",
        "text": "def test_total_is_calculated_correctly():\n    items = [120, 80, 50]\n\n    actual_total = sum(items)\n\n    assert actual_total == 250",
        "lesson": "Why this matters: Keep test data readable and assert one clear behavior. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY1-03",
        "concept": "Use pytest parameterization instead of duplicating similar tests.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"username,expected\",\n    [\n        (\"admin\", True),\n        (\"guest\", False),\n        (\"operator\", True),\n    ],\n)\ndef test_allowed_users(username, expected):\n    assert is_allowed(username) is expected",
        "lesson": "Why this matters: Use pytest parameterization instead of duplicating similar tests. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY1-04",
        "concept": "Validate both status and essential response fields.",
        "text": "def test_login_returns_token(api_client, valid_user):\n    response = api_client.post(\n        \"/api/login\",\n        json=valid_user,\n    )\n\n    assert response.status_code == 200\n    body = response.json()\n    assert isinstance(body.get(\"token\"), str)\n    assert body[\"token\"]",
        "lesson": "Why this matters: Validate both status and essential response fields. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY1-05",
        "concept": "Use pathlib for portable file paths.",
        "text": "from pathlib import Path\n\nreport_dir = Path(\"reports\")\nreport_dir.mkdir(parents=True, exist_ok=True)\n\nresult_file = report_dir / \"smoke_results.txt\"\nresult_file.write_text(\"PASS\n\", encoding=\"utf-8\")",
        "lesson": "Why this matters: Use pathlib for portable file paths. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY1-06",
        "concept": "Use clear assertions with expected values.",
        "text": "def test_ticket_defaults():\n    ticket = create_ticket(\"Login failure\")\n\n    assert ticket[\"status\"] == \"OPEN\"\n    assert ticket[\"priority\"] == \"MEDIUM\"\n    assert ticket[\"title\"] == \"Login failure\"",
        "lesson": "Why this matters: Use clear assertions with expected values. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      }
    ],
    "2": [
      {
        "id": "PY2-01",
        "concept": "Reuse HTTP connections with requests.Session and set common headers once.",
        "text": "import os\nimport requests\n\nbase_url = os.environ[\"BASE_URL\"].rstrip(\"/\")\nsession = requests.Session()\nsession.headers.update({\"Accept\": \"application/json\"})\n\nresponse = session.get(\n    f\"{base_url}/api/tickets\",\n    timeout=10,\n)\n\nresponse.raise_for_status()\nassert isinstance(response.json(), list)",
        "lesson": "Why this matters: Reuse HTTP connections with requests.Session and set common headers once. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY2-02",
        "concept": "Use fixtures for reusable setup and cleanup.",
        "text": "import pytest\n\n@pytest.fixture\ndef sample_ticket():\n    ticket = create_ticket(title=\"Printer offline\")\n    yield ticket\n    delete_ticket(ticket[\"id\"])\n\n\ndef test_ticket_can_be_closed(sample_ticket):\n    result = close_ticket(sample_ticket[\"id\"])\n    assert result[\"status\"] == \"CLOSED\"",
        "lesson": "Why this matters: Use fixtures for reusable setup and cleanup. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY2-03",
        "concept": "Read configuration from environment variables, not hardcoded secrets.",
        "text": "import os\n\nBASE_URL = os.environ[\"BASE_URL\"].rstrip(\"/\")\nAPI_TOKEN = os.environ[\"API_TOKEN\"]\n\nheaders = {\n    \"Authorization\": f\"Bearer {API_TOKEN}\",\n    \"Accept\": \"application/json\",\n}\n\nassert BASE_URL.startswith((\"http://\", \"https://\"))\nassert headers[\"Authorization\"].startswith(\"Bearer \")",
        "lesson": "Why this matters: Read configuration from environment variables, not hardcoded secrets. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY2-04",
        "concept": "Log useful test context without hiding assertion failures.",
        "text": "import logging\n\nlogger = logging.getLogger(__name__)\n\n\ndef test_user_profile(api_client):\n    response = api_client.get(\"/api/profile\")\n    logger.info(\"Profile response status=%s\", response.status_code)\n\n    assert response.status_code == 200\n    assert response.json()[\"active\"] is True",
        "lesson": "Why this matters: Log useful test context without hiding assertion failures. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY2-05",
        "concept": "Use temporary paths instead of writing test artifacts into the project root.",
        "text": "def test_export_creates_csv(tmp_path):\n    output_file = tmp_path / \"tickets.csv\"\n\n    export_tickets(output_file)\n\n    assert output_file.exists()\n    content = output_file.read_text(encoding=\"utf-8\")\n    assert \"ticket_id,status\" in content",
        "lesson": "Why this matters: Use temporary paths instead of writing test artifacts into the project root. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY2-06",
        "concept": "Test negative behavior explicitly with pytest.raises.",
        "text": "import pytest\n\n\ndef test_invalid_priority_is_rejected():\n    with pytest.raises(ValueError, match=\"Unsupported priority\"):\n        create_ticket(\n            title=\"Database alert\",\n            priority=\"URGENTEST\",\n        )",
        "lesson": "Why this matters: Test negative behavior explicitly with pytest.raises. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      }
    ],
    "3": [
      {
        "id": "PY3-01",
        "concept": "Create a small API client so tests focus on behavior, not request plumbing.",
        "text": "import requests\n\nclass ApiClient:\n    def __init__(self, base_url, token):\n        self.base_url = base_url.rstrip(\"/\")\n        self.session = requests.Session()\n        self.session.headers.update({\n            \"Authorization\": f\"Bearer {token}\",\n            \"Accept\": \"application/json\",\n        })\n\n    def get_ticket(self, ticket_id):\n        return self.session.get(\n            f\"{self.base_url}/api/tickets/{ticket_id}\",\n            timeout=10,\n        )",
        "lesson": "Why this matters: Create a small API client so tests focus on behavior, not request plumbing. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY3-02",
        "concept": "Assert response shape before relying on extracted values.",
        "text": "def test_create_ticket(api_client):\n    response = api_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"VPN unavailable\", \"priority\": \"HIGH\"},\n    )\n\n    assert response.status_code == 201\n    body = response.json()\n    assert isinstance(body.get(\"id\"), int)\n    assert body[\"status\"] == \"OPEN\"\n    assert body[\"priority\"] == \"HIGH\"",
        "lesson": "Why this matters: Assert response shape before relying on extracted values. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY3-03",
        "concept": "Parameterize negative API cases with expected status codes.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"payload,expected_status\",\n    [\n        ({}, 400),\n        ({\"title\": \"\"}, 400),\n        ({\"title\": \"Disk full\", \"priority\": \"INVALID\"}, 422),\n    ],\n)\ndef test_create_ticket_rejects_invalid_payloads(api_client, payload, expected_status):\n    response = api_client.post(\"/api/tickets\", json=payload)\n    assert response.status_code == expected_status",
        "lesson": "Why this matters: Parameterize negative API cases with expected status codes. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY3-04",
        "concept": "Use subprocess with argument lists and check=True for test tools.",
        "text": "import subprocess\n\nresult = subprocess.run(\n    [\"python\", \"-m\", \"pytest\", \"tests/test_login.py\", \"-q\"],\n    check=True,\n    capture_output=True,\n    text=True,\n)\n\nassert \"passed\" in result.stdout.lower()",
        "lesson": "Why this matters: Use subprocess with argument lists and check=True for test tools. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY3-05",
        "concept": "Separate data loading from assertions and validate required fields.",
        "text": "import json\nfrom pathlib import Path\n\nfixture_path = Path(\"testdata\") / \"users.json\"\nusers = json.loads(fixture_path.read_text(encoding=\"utf-8\"))\n\nrequired = {\"username\", \"role\", \"active\"}\nfor user in users:\n    assert required.issubset(user)\n    assert isinstance(user[\"active\"], bool)",
        "lesson": "Why this matters: Separate data loading from assertions and validate required fields. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY3-06",
        "concept": "Use deterministic polling with a deadline instead of arbitrary sleep loops.",
        "text": "import time\n\n\ndef wait_for_status(fetch_status, expected, timeout=10):\n    deadline = time.monotonic() + timeout\n\n    while time.monotonic() < deadline:\n        if fetch_status() == expected:\n            return\n        time.sleep(0.25)\n\n    raise TimeoutError(f\"Status did not become {expected!r}\")",
        "lesson": "Why this matters: Use deterministic polling with a deadline instead of arbitrary sleep loops. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      }
    ],
    "4": [
      {
        "id": "PY4-01",
        "concept": "Build reusable pytest API fixtures with cleanup and environment-based configuration.",
        "text": "import os\nimport pytest\nimport requests\n\n@pytest.fixture(scope=\"session\")\ndef api_session():\n    base_url = os.environ[\"BASE_URL\"].rstrip(\"/\")\n    token = os.environ[\"API_TOKEN\"]\n\n    session = requests.Session()\n    session.headers.update({\n        \"Authorization\": f\"Bearer {token}\",\n        \"Accept\": \"application/json\",\n    })\n    session.base_url = base_url\n\n    yield session\n    session.close()",
        "lesson": "Why this matters: Build reusable pytest API fixtures with cleanup and environment-based configuration. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY4-02",
        "concept": "Capture diagnostics only when useful, and preserve the original test failure.",
        "text": "import json\nfrom pathlib import Path\n\n\ndef save_failure_artifact(name, response, output_dir=Path(\"artifacts\")):\n    output_dir.mkdir(parents=True, exist_ok=True)\n    artifact = {\n        \"status_code\": response.status_code,\n        \"headers\": dict(response.headers),\n        \"body\": response.text[:5000],\n    }\n\n    path = output_dir / f\"{name}.json\"\n    path.write_text(\n        json.dumps(artifact, indent=2),\n        encoding=\"utf-8\",\n    )\n    return path",
        "lesson": "Why this matters: Capture diagnostics only when useful, and preserve the original test failure. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY4-03",
        "concept": "Use precise contract checks for nested response data.",
        "text": "def test_assignment_response(\n    api_client,\n    created_ticket,\n    assignee,\n):\n    ticket_id = created_ticket[\"id\"]\n    response = api_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": assignee},\n    )\n\n    assert response.status_code == 200\n    body = response.json()\n    assert body[\"ticket\"][\"id\"] == ticket_id\n    assert body[\"ticket\"][\"owner\"] == assignee\n    assert body[\"audit\"][\"action\"] == \"ASSIGNED\"",
        "lesson": "Why this matters: Use precise contract checks for nested response data. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY4-04",
        "concept": "Use factory fixtures to create isolated test data for each scenario.",
        "text": "import pytest\n\n@pytest.fixture\ndef ticket_factory(api_client):\n    created_ids = []\n\n    def create(**overrides):\n        payload = {\n            \"title\": \"Automation test ticket\",\n            \"priority\": \"MEDIUM\",\n            **overrides,\n        }\n        response = api_client.post(\"/api/tickets\", json=payload)\n        assert response.status_code == 201\n        ticket = response.json()\n        created_ids.append(ticket[\"id\"])\n        return ticket\n\n    yield create\n\n    for ticket_id in created_ids:\n        api_client.delete(f\"/api/tickets/{ticket_id}\")",
        "lesson": "Why this matters: Use factory fixtures to create isolated test data for each scenario. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY4-05",
        "concept": "Keep retries narrowly scoped to eventually consistent state, not assertion failures.",
        "text": "import time\n\n\ndef poll_until(fetch, predicate, timeout=15, interval=0.5):\n    deadline = time.monotonic() + timeout\n    last_value = None\n\n    while time.monotonic() < deadline:\n        last_value = fetch()\n        if predicate(last_value):\n            return last_value\n        time.sleep(interval)\n\n    raise AssertionError(\n        f\"Condition not met within {timeout}s; last value={last_value!r}\"\n    )",
        "lesson": "Why this matters: Keep retries narrowly scoped to eventually consistent state, not assertion failures. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      },
      {
        "id": "PY4-06",
        "concept": "Validate an end-to-end API workflow while keeping assertions close to each action.",
        "text": "def test_restricted_assignment_flow(api_client, employee_client):\n    create = employee_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"Payroll access\", \"priority\": \"HIGH\"},\n    )\n    assert create.status_code == 201\n    ticket_id = create.json()[\"id\"]\n\n    forbidden = employee_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert forbidden.status_code == 403\n\n    allowed = api_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert allowed.status_code == 200\n    assert allowed.json()[\"owner\"] == \"employee03\"",
        "lesson": "Why this matters: Validate an end-to-end API workflow while keeping assertions close to each action. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded secrets or environment URLs, duplicated setup, unbounded waits, and copy-pasted assertions."
      }
    ]
  },
  "Selenium": {
    "1": [
      {
        "id": "SEL1-01",
        "concept": "Keep environment-specific URLs outside test code.",
        "lesson": "Configuration belongs in environment variables or pytest options. This lets the same test run against local, staging, or competition environments without editing code.",
        "avoid": "Avoid embedding localhost, staging URLs, credentials, or ports inside test functions.",
        "text": "import os\n\nBASE_URL = os.environ[\"BASE_URL\"].rstrip(\"/\")\n\ndef test_login_page_opens(driver):\n    driver.get(f\"{BASE_URL}/login\")\n\n    assert driver.current_url.endswith(\"/login\")"
      },
      {
        "id": "SEL1-02",
        "concept": "Prefer stable, intention-revealing locators.",
        "lesson": "Use unique IDs or application-owned data attributes. Keep locators named and separate from actions so failures are easier to understand and maintain.",
        "avoid": "Avoid absolute XPath, generated CSS classes, and deeply nested selectors.",
        "text": "from selenium.webdriver.common.by import By\n\nUSERNAME = (By.ID, \"username\")\nPASSWORD = (By.ID, \"password\")\nSUBMIT = (By.CSS_SELECTOR, \"[data-testid='login-submit']\")\n\nusername_input = driver.find_element(*USERNAME)\npassword_input = driver.find_element(*PASSWORD)"
      },
      {
        "id": "SEL1-03",
        "concept": "Use explicit waits for UI state transitions.",
        "lesson": "Wait for the exact condition the user needs, such as visibility or clickability. Explicit waits make asynchronous UI tests more deterministic.",
        "avoid": "Avoid fixed sleeps because they are either slower than necessary or too short under load.",
        "text": "from selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.support.ui import WebDriverWait\n\nwait = WebDriverWait(driver, 10)\nsubmit = wait.until(\n    EC.element_to_be_clickable(\n        (By.CSS_SELECTOR, \"[data-testid='login-submit']\")\n    )\n)\nsubmit.click()"
      },
      {
        "id": "SEL1-04",
        "concept": "Keep test data outside page interaction code.",
        "lesson": "Page methods should accept data as arguments. Tests or fixtures decide which user or value to use, keeping Page Objects reusable.",
        "avoid": "Avoid embedding usernames, passwords, ticket titles, or expected IDs in Page Objects.",
        "text": "def login(driver, username, password):\n    driver.find_element(By.ID, \"username\").send_keys(username)\n    driver.find_element(By.ID, \"password\").send_keys(password)\n    driver.find_element(\n        By.CSS_SELECTOR,\n        \"[data-testid='login-submit']\",\n    ).click()"
      },
      {
        "id": "SEL1-05",
        "concept": "Assert outcomes that a user can observe.",
        "lesson": "After an action, assert a visible result such as a heading, status message, URL, or changed value. This verifies behavior rather than implementation details.",
        "avoid": "Avoid asserting internal JavaScript variables or arbitrary DOM structure.",
        "text": "from selenium.webdriver.support import expected_conditions as EC\n\nheading = wait.until(\n    EC.visibility_of_element_located(\n        (By.CSS_SELECTOR, \"[data-testid='page-heading']\")\n    )\n)\n\nassert heading.text == expected_heading"
      },
      {
        "id": "SEL1-06",
        "concept": "Create browser setup once and always clean it up.",
        "lesson": "A pytest fixture centralizes WebDriver lifecycle. The yield pattern guarantees browser cleanup even when a test fails.",
        "avoid": "Avoid creating drivers in every test or forgetting driver.quit().",
        "text": "import pytest\nfrom selenium import webdriver\n\n@pytest.fixture\ndef driver():\n    options = webdriver.ChromeOptions()\n    options.add_argument(\"--window-size=1440,900\")\n\n    browser = webdriver.Chrome(options=options)\n    yield browser\n    browser.quit()"
      }
    ],
    "2": [
      {
        "id": "SEL2-01",
        "concept": "Use Page Objects to expose user actions, not WebDriver details.",
        "lesson": "A test should read like a user workflow. The Page Object owns locators and interactions while the test owns assertions and intent.",
        "avoid": "Avoid exposing every find_element call to the test.",
        "text": "class LoginPage:\n    USERNAME = (By.ID, \"username\")\n    PASSWORD = (By.ID, \"password\")\n    SUBMIT = (By.CSS_SELECTOR, \"[data-testid='login-submit']\")\n\n    def __init__(self, driver):\n        self.driver = driver\n\n    def login(self, username, password):\n        self.driver.find_element(*self.USERNAME).send_keys(username)\n        self.driver.find_element(*self.PASSWORD).send_keys(password)\n        self.driver.find_element(*self.SUBMIT).click()"
      },
      {
        "id": "SEL2-02",
        "concept": "Give Page Objects their own explicit wait.",
        "lesson": "Centralizing the wait in the page object prevents duplicated timing logic and makes page methods consistently resilient.",
        "avoid": "Avoid mixing arbitrary sleeps with page actions.",
        "text": "class BasePage:\n    def __init__(self, driver, timeout=10):\n        self.driver = driver\n        self.wait = WebDriverWait(driver, timeout)\n\n    def visible(self, locator):\n        return self.wait.until(\n            EC.visibility_of_element_located(locator)\n        )\n\n    def clickable(self, locator):\n        return self.wait.until(\n            EC.element_to_be_clickable(locator)\n        )"
      },
      {
        "id": "SEL2-03",
        "concept": "Read credentials from a fixture or secret source.",
        "lesson": "Tests can request a credential object without knowing how secrets are stored. This keeps sensitive data out of source control and typing examples.",
        "avoid": "Avoid literal passwords in tests, Page Objects, or repositories.",
        "text": "import os\nimport pytest\n\n@pytest.fixture(scope=\"session\")\ndef test_user():\n    return {\n        \"username\": os.environ[\"TEST_USERNAME\"],\n        \"password\": os.environ[\"TEST_PASSWORD\"],\n    }\n\ndef test_user_can_login(driver, test_user):\n    page = LoginPage(driver)\n    page.login(**test_user)"
      },
      {
        "id": "SEL2-04",
        "concept": "Parameterize repeated validation scenarios.",
        "lesson": "One well-named test with data rows is easier to extend and diagnose than several copy-pasted tests.",
        "avoid": "Avoid duplicating the same browser workflow for each input combination.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"username,password\",\n    [\n        (\"\", \"valid-password\"),\n        (\"valid-user\", \"\"),\n        (\"unknown-user\", \"invalid-password\"),\n    ],\n)\ndef test_invalid_login_is_rejected(\n    login_page,\n    username,\n    password,\n):\n    login_page.login(username, password)\n    assert login_page.error_message().is_displayed()"
      },
      {
        "id": "SEL2-05",
        "concept": "Use Select only for real HTML select controls.",
        "lesson": "Selenium's Select wrapper expresses intent clearly for native select elements. Custom dropdowns need their own component interaction.",
        "avoid": "Avoid forcing Select onto div-based custom widgets.",
        "text": "from selenium.webdriver.support.ui import Select\n\ndef choose_priority(driver, priority_name):\n    element = driver.find_element(By.ID, \"priority\")\n    select = Select(element)\n    select.select_by_visible_text(priority_name)\n\n    return select.first_selected_option.text"
      },
      {
        "id": "SEL2-06",
        "concept": "Generate unique data for repeatable UI tests.",
        "lesson": "Unique values reduce collisions across reruns and parallel execution. A small factory keeps that concern out of the test workflow.",
        "avoid": "Avoid fixed email addresses, ticket references, or names that must be unique.",
        "text": "from uuid import uuid4\n\ndef unique_reference(prefix=\"ui\"):\n    return f\"{prefix}-{uuid4().hex[:10]}\"\n\ndef test_create_record(create_page):\n    reference = unique_reference()\n    create_page.create(reference=reference)\n\n    assert create_page.success_reference() == reference"
      }
    ],
    "3": [
      {
        "id": "SEL3-01",
        "concept": "Return the next Page Object after navigation.",
        "lesson": "When an action takes the user to another page, returning that page object makes the workflow readable and keeps navigation knowledge inside the page layer.",
        "avoid": "Avoid making tests manually reconstruct page objects after every click.",
        "text": "class LoginPage(BasePage):\n    SUBMIT = (By.CSS_SELECTOR, \"[data-testid='login-submit']\")\n\n    def submit(self, username, password):\n        self.enter_username(username)\n        self.enter_password(password)\n        self.clickable(self.SUBMIT).click()\n\n        return DashboardPage(self.driver)"
      },
      {
        "id": "SEL3-02",
        "concept": "Model reusable UI regions as component objects.",
        "lesson": "Headers, tables, dialogs, and toasts often appear on several pages. A component object prevents locator and interaction duplication.",
        "avoid": "Avoid copying the same menu or dialog logic into multiple Page Objects.",
        "text": "class ToastComponent(BasePage):\n    ROOT = (By.CSS_SELECTOR, \"[role='status']\")\n\n    def message(self):\n        return self.visible(self.ROOT).text\n\nclass CreatePage(BasePage):\n    def toast(self):\n        return ToastComponent(self.driver)"
      },
      {
        "id": "SEL3-03",
        "concept": "Wait for an old element to become stale after refresh.",
        "lesson": "Staleness is useful when the UI replaces an existing element. Waiting on the old reference avoids reading stale content too early.",
        "avoid": "Avoid sleeping after refresh and hoping the DOM has updated.",
        "text": "from selenium.webdriver.support import expected_conditions as EC\n\nold_row = driver.find_element(\n    By.CSS_SELECTOR,\n    \"[data-testid='results-row']\",\n)\nrefresh_button.click()\n\nwait.until(EC.staleness_of(old_row))\nnew_row = wait.until(\n    EC.visibility_of_element_located(\n        (By.CSS_SELECTOR, \"[data-testid='results-row']\")\n    )\n)"
      },
      {
        "id": "SEL3-04",
        "concept": "Scope locators to a component before reading table data.",
        "lesson": "Finding cells relative to a row reduces accidental matches elsewhere on the page and makes table helpers reusable.",
        "avoid": "Avoid global selectors for every cell in a dynamic table.",
        "text": "class ResultRow:\n    NAME = (By.CSS_SELECTOR, \"[data-col='name']\")\n    STATUS = (By.CSS_SELECTOR, \"[data-col='status']\")\n\n    def __init__(self, root):\n        self.root = root\n\n    def name(self):\n        return self.root.find_element(*self.NAME).text\n\n    def status(self):\n        return self.root.find_element(*self.STATUS).text"
      },
      {
        "id": "SEL3-05",
        "concept": "Wait for a new window by comparing handles.",
        "lesson": "Capture existing handles before the click, wait for one new handle, then switch explicitly. This is safer than assuming array position.",
        "avoid": "Avoid assuming the new tab is always window_handles[1].",
        "text": "original = driver.current_window_handle\nexisting = set(driver.window_handles)\n\nopen_report.click()\nwait.until(\n    lambda d: len(set(d.window_handles) - existing) == 1\n)\n\nnew_handle = (set(driver.window_handles) - existing).pop()\ndriver.switch_to.window(new_handle)\n\nassert driver.current_window_handle != original"
      },
      {
        "id": "SEL3-06",
        "concept": "Capture failure evidence automatically with unique names.",
        "lesson": "A pytest hook can save screenshots only for failed tests. Including the test name and worker-safe identifier makes artifacts useful in parallel runs.",
        "avoid": "Avoid manually adding save_screenshot calls to every test.",
        "text": "from pathlib import Path\n\ndef save_failure_screenshot(driver, test_name, run_id):\n    output = Path(\"artifacts\")\n    output.mkdir(parents=True, exist_ok=True)\n\n    path = output / f\"{test_name}-{run_id}.png\"\n    driver.save_screenshot(str(path))\n\n    return path"
      }
    ],
    "4": [
      {
        "id": "SEL4-01",
        "concept": "Keep end-to-end tests focused on one critical business path.",
        "lesson": "An end-to-end test should prove a valuable workflow while delegating details to Page Objects and fixtures. Keep setup and cleanup reusable.",
        "avoid": "Avoid one giant test that verifies every screen and every edge case.",
        "text": "def test_user_can_create_record(\n    authenticated_dashboard,\n    record_factory,\n):\n    record = record_factory.build()\n\n    create_page = authenticated_dashboard.open_create_page()\n    details_page = create_page.create(record)\n\n    assert details_page.reference() == record.reference\n    assert details_page.status() == \"OPEN\""
      },
      {
        "id": "SEL4-02",
        "concept": "Separate test data construction from UI interaction.",
        "lesson": "A factory creates valid default data and allows small overrides. Tests stay focused on the behavior they intend to verify.",
        "avoid": "Avoid large inline dictionaries repeated across UI tests.",
        "text": "from dataclasses import dataclass, replace\nfrom uuid import uuid4\n\n@dataclass(frozen=True)\nclass RecordData:\n    reference: str\n    priority: str = \"Medium\"\n\ndef build_record(**overrides):\n    base = RecordData(reference=f\"ui-{uuid4().hex[:10]}\")\n    return replace(base, **overrides)"
      },
      {
        "id": "SEL4-03",
        "concept": "Use a custom wait only for a real application-specific condition.",
        "lesson": "Expected conditions cover most cases. A small custom predicate is appropriate when readiness depends on a domain state Selenium cannot express directly.",
        "avoid": "Avoid general retry loops that hide product or assertion failures.",
        "text": "def status_is(locator, expected):\n    def condition(driver):\n        text = driver.find_element(*locator).text.strip()\n        return text == expected\n\n    return condition\n\nwait.until(\n    status_is(\n        (By.CSS_SELECTOR, \"[data-testid='record-status']\"),\n        expected_status,\n    )\n)"
      },
      {
        "id": "SEL4-04",
        "concept": "Test permissions with role-specific fixtures.",
        "lesson": "Authentication setup should be reusable. The test then expresses the authorization rule instead of embedding account details.",
        "avoid": "Avoid hardcoded admin and employee credentials in permission tests.",
        "text": "def test_standard_user_cannot_open_admin_page(\n    standard_user_driver,\n    base_url,\n):\n    standard_user_driver.get(f\"{base_url}/admin/users\")\n\n    alert = WebDriverWait(standard_user_driver, 10).until(\n        EC.visibility_of_element_located((By.CSS_SELECTOR, \"[role='alert']\"))\n    )\n\n    assert \"permission\" in alert.text.lower()"
      },
      {
        "id": "SEL4-05",
        "concept": "Assert state with semantic accessibility attributes.",
        "lesson": "Stateful controls often expose aria-expanded, aria-selected, or aria-checked. These attributes can be more reliable than visual class names.",
        "avoid": "Avoid asserting CSS classes that exist only for styling.",
        "text": "toggle = wait.until(\n    EC.element_to_be_clickable(\n        (By.CSS_SELECTOR, \"[data-testid='filters-toggle']\")\n    )\n)\n\ntoggle.click()\nwait.until(\n    lambda d: toggle.get_attribute(\"aria-expanded\") == \"true\"\n)\n\nassert toggle.get_attribute(\"aria-expanded\") == \"true\""
      },
      {
        "id": "SEL4-06",
        "concept": "Keep cleanup independent from the browser test assertion path.",
        "lesson": "API or fixture cleanup is often faster and more reliable than navigating the UI just to delete test data. Cleanup should run even after assertion failure.",
        "avoid": "Avoid leaving created records behind or coupling cleanup to the test's final UI step.",
        "text": "import pytest\n\n@pytest.fixture\ndef created_record(api_client, record_factory):\n    record = api_client.create_record(record_factory.build())\n\n    yield record\n\n    api_client.delete_record(record.id)\n\ndef test_record_is_visible(records_page, created_record):\n    records_page.open()\n    assert records_page.contains(created_record.reference)"
      }
    ]
  },
  "JMeter": {
    "1": [
      {
        "id": "JM1-01",
        "concept": "Run load tests in non-GUI mode and save a JTL result file.",
        "text": "jmeter -n   -t smoke_test.jmx   -l results/smoke.jtl",
        "lesson": "Why this matters: Run load tests in non-GUI mode and save a JTL result file. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM1-02",
        "concept": "Use JMeter properties so workload values can change from a readable PowerShell command.",
        "text": "jmeter -n `\n    -t load_test.jmx `\n    -Jusers=10 `\n    -Jramp=30 `\n    -Jduration=120 `\n    -l results/load.jtl",
        "lesson": "Why this matters: Use JMeter properties so workload values can change from a readable PowerShell command. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM1-03",
        "concept": "Use JMeter variables for correlated values inside requests.",
        "text": "Authorization: Bearer ${access_token}\nContent-Type: application/json\nX-Request-Id: ${request_id}\n\n/api/tickets/${ticket_id}",
        "lesson": "Why this matters: Use JMeter variables for correlated values inside requests. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM1-04",
        "concept": "Use a JSON Extractor expression that targets the exact field you need.",
        "text": "Variable name: access_token\nJSON Path expression: $.token\nMatch No.: 1\nDefault Value: NOT_FOUND",
        "lesson": "Why this matters: Use a JSON Extractor expression that targets the exact field you need. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM1-05",
        "concept": "Assert expected response codes explicitly, including negative tests.",
        "text": "Response Assertion\nField to Test: Response Code\nPattern Matching Rule: Equals\nPatterns to Test: 403",
        "lesson": "Why this matters: Assert expected response codes explicitly, including negative tests. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM1-06",
        "concept": "Generate the HTML report from the same final JTL file with a readable PowerShell command.",
        "text": "jmeter -n `\n    -t final_regression.jmx `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression",
        "lesson": "Why this matters: Generate the HTML report from the same final JTL file with a readable PowerShell command. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      }
    ],
    "2": [
      {
        "id": "JM2-01",
        "concept": "Use Groovy in JSR223 elements for efficient scripting.",
        "text": "import groovy.json.JsonSlurper\n\ndef body = prev.getResponseDataAsString()\ndef json = new JsonSlurper().parseText(body)\n\nassert json.id != null : \"Response id is missing\"\nvars.put(\"ticketId\", json.id.toString())",
        "lesson": "Why this matters: Use Groovy in JSR223 elements for efficient scripting. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM2-02",
        "concept": "Fail fast when correlation returns its default value.",
        "text": "def token = vars.get(\"access_token\")\n\nif (!token || token == \"NOT_FOUND\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"access_token was not extracted\")\n}",
        "lesson": "Why this matters: Fail fast when correlation returns its default value. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM2-03",
        "concept": "Create unique external references instead of reusing fixed test data.",
        "text": "import java.util.UUID\n\ndef externalRef = \"perf-\" + UUID.randomUUID().toString()\nvars.put(\"externalRef\", externalRef)\n\nlog.info(\"Generated externalRef={}\", externalRef)",
        "lesson": "Why this matters: Create unique external references instead of reusing fixed test data. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM2-04",
        "concept": "Keep per-user correlation in JMeter variables, not global properties.",
        "text": "def ticketId = vars.get(\"ticketId\")\n\ndef payload = \"\"\"{\n  \"ticketId\": ${ticketId},\n  \"status\": \"IN_PROGRESS\"\n}\"\"\"\n\nvars.put(\"updatePayload\", payload)",
        "lesson": "Why this matters: Keep per-user correlation in JMeter variables, not global properties. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM2-05",
        "concept": "Use randomized think time instead of one fixed pause.",
        "text": "Uniform Random Timer\nRandom Delay Maximum: 400\nConstant Delay Offset: 400\n\nEffective delay range: 400 to 800 ms",
        "lesson": "Why this matters: Use randomized think time instead of one fixed pause. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM2-06",
        "concept": "Parameterize thread count and duration with __P for command-line control.",
        "text": "Number of Threads: ${__P(users,10)}\nRamp-up Period: ${__P(ramp,30)}\nDuration: ${__P(duration,120)}\n\nLoop Count: Forever\nScheduler: Enabled",
        "lesson": "Why this matters: Parameterize thread count and duration with __P for command-line control. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      }
    ],
    "3": [
      {
        "id": "JM3-01",
        "concept": "Validate a JSON response and preserve a correlated ID for later samplers.",
        "text": "import groovy.json.JsonSlurper\n\ndef responseText = prev.getResponseDataAsString()\ndef json = new JsonSlurper().parseText(responseText)\n\nif (prev.getResponseCode() != \"201\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\n        \"Expected 201 but received ${prev.getResponseCode()}\"\n    )\n}\n\nif (!json.id) {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"Created ticket id is missing\")\n} else {\n    vars.put(\"ticketId\", json.id.toString())\n}",
        "lesson": "Why this matters: Validate a JSON response and preserve a correlated ID for later samplers. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM3-02",
        "concept": "Distinguish an expected 403 negative test from an unexpected failure.",
        "text": "def code = prev.getResponseCode()\ndef body = prev.getResponseDataAsString()\n\nif (code != \"403\") {\n    AssertionResult.setFailure(true)\n\n    def message = \"Restricted assignment expected HTTP 403, \" +\n        \"received ${code}; body=${body}\"\n\n    AssertionResult.setFailureMessage(message)\n}",
        "lesson": "Why this matters: Distinguish an expected 403 negative test from an unexpected failure. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM3-03",
        "concept": "Use CSV data for reusable test users and keep variables local to each thread.",
        "text": "CSV Data Set Config\nFilename: data/users.csv\nVariable Names: username,password,role\nDelimiter: ,\nRecycle on EOF: True\nStop thread on EOF: False\nSharing mode: Current thread group",
        "lesson": "Why this matters: Use CSV data for reusable test users and keep variables local to each thread. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM3-04",
        "concept": "Use a preprocessor to create a realistic unique request payload.",
        "text": "import groovy.json.JsonOutput\nimport java.util.UUID\n\ndef payload = [\n    title      : \"Load test ${UUID.randomUUID()}\",\n    priority   : \"HIGH\",\n    externalRef: \"jmeter-${UUID.randomUUID()}\"\n]\n\nvars.put(\"requestBody\", JsonOutput.toJson(payload))",
        "lesson": "Why this matters: Use a preprocessor to create a realistic unique request payload. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM3-05",
        "concept": "Make the final run reproducible with explicit properties in a readable PowerShell command.",
        "text": "jmeter -n `\n    -t plans/final_regression.jmx `\n    -Jusers=$env:JMETER_USERS `\n    -Jramp=$env:JMETER_RAMP_SECONDS `\n    -Jduration=$env:JMETER_DURATION_SECONDS `\n    -JbaseUrl=$env:BASE_URL `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression",
        "lesson": "Why this matters: Make the final run reproducible with explicit properties in a readable PowerShell command. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM3-06",
        "concept": "Log correlation failures with enough context to diagnose the sampler.",
        "text": "def ticketId = vars.get(\"ticketId\")\n\nif (!ticketId) {\n    log.error(\n        \"ticketId missing after sampler={}, responseCode={}\",\n        prev.getSampleLabel(),\n        prev.getResponseCode()\n    )\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"ticketId correlation failed\")\n}",
        "lesson": "Why this matters: Log correlation failures with enough context to diagnose the sampler. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      }
    ],
    "4": [
      {
        "id": "JM4-01",
        "concept": "Use JSR223 assertions to classify unexpected server failures precisely.",
        "text": "import groovy.json.JsonSlurper\n\ndef code = prev.getResponseCode()\ndef body = prev.getResponseDataAsString()\n\ndef json = null\ntry {\n    json = new JsonSlurper().parseText(body)\n} catch (ignored) {\n    // Keep raw body for diagnostics when response is not JSON.\n}\n\nif (code != \"200\") {\n    AssertionResult.setFailure(true)\n\n    def detail = json?.error ?: body.take(500)\n    def message = \"Expected HTTP 200, received ${code}; \" +\n        \"error=${detail}\"\n\n    AssertionResult.setFailureMessage(message)\n}\n\nif (code == \"200\" && json?.status != \"OPEN\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\n        \"Expected status OPEN, received ${json?.status}\"\n    )\n}",
        "lesson": "Why this matters: Use JSR223 assertions to classify unexpected server failures precisely. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM4-02",
        "concept": "Keep staged workload settings explicit so each phase is reproducible.",
        "text": "Stage 1: users=5,  ramp=30, duration=120\nStage 2: users=10, ramp=30, duration=120\nStage 3: users=25, ramp=60, duration=180\nStage 4: users=40, ramp=60, duration=180\nStage 5: users=5,  ramp=30, duration=120\n\nPacing: Uniform Random Timer, 400 to 800 ms\nResults: one clean JTL per stage plus one final regression JTL",
        "lesson": "Why this matters: Keep staged workload settings explicit so each phase is reproducible. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM4-03",
        "concept": "Create thread-safe unique business data without using global mutable properties.",
        "text": "import groovy.json.JsonOutput\nimport java.util.UUID\n\nString user = vars.get(\"username\") ?: \"anonymous\"\nString ref = \"${user}-${UUID.randomUUID()}\"\n\ndef body = [\n    title      : \"Performance validation\",\n    priority   : \"HIGH\",\n    externalRef: ref\n]\n\nvars.put(\"externalRef\", ref)\nvars.put(\"requestBody\", JsonOutput.toJson(body))",
        "lesson": "Why this matters: Create thread-safe unique business data without using global mutable properties. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM4-04",
        "concept": "Check both ownership and asset correlation after extracting dependent IDs.",
        "text": "def ticketId = vars.get(\"ticketId\")\ndef ownerId = vars.get(\"ownerId\")\ndef assetId = vars.get(\"assetId\")\n\n[\n    ticketId: ticketId,\n    ownerId : ownerId,\n    assetId : assetId,\n].each { name, value ->\n    if (!value || value == \"NOT_FOUND\") {\n        AssertionResult.setFailure(true)\n        AssertionResult.setFailureMessage(\"${name} correlation failed\")\n    }\n}",
        "lesson": "Why this matters: Check both ownership and asset correlation after extracting dependent IDs. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM4-05",
        "concept": "Run baseline and final regression separately with readable PowerShell commands.",
        "text": "New-Item -ItemType Directory -Force results, reports\n\njmeter -n `\n    -t plans/baseline.jmx `\n    -l results/baseline.jtl `\n    -e `\n    -o reports/baseline\n\njmeter -n `\n    -t plans/final_regression.jmx `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression",
        "lesson": "Why this matters: Run baseline and final regression separately with readable PowerShell commands. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      },
      {
        "id": "JM4-06",
        "concept": "Validate a chained create-read-update flow while keeping correlation thread-local.",
        "text": "// After CREATE sampler\nimport groovy.json.JsonSlurper\n\ndef created = new JsonSlurper().parseText(prev.getResponseDataAsString())\nassert prev.getResponseCode() == \"201\"\nassert created.id != null\nvars.put(\"ticketId\", created.id.toString())\n\n// Later samplers use ${ticketId}; do not copy it into a global property.\n// READ should return 200 before UPDATE is attempted.\n// UPDATE should assert both HTTP status and the changed business field.",
        "lesson": "Why this matters: Validate a chained create-read-update flow while keeping correlation thread-local. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid GUI load execution, shared global correlation state, magic environment values, and extractors that are never validated."
      }
    ]
  },
  "Postman": {
    "1": [
      {
        "id": "PM1-01",
        "concept": "Assert the response status with a named Postman test.",
        "text": "pm.test(\"Status code is 200\", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test(\"Response is JSON\", function () {\n    pm.response.to.be.json;\n});",
        "lesson": "Why this matters: Assert the response status with a named Postman test. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM1-02",
        "concept": "Parse the response once and reuse the parsed object.",
        "text": "const body = pm.response.json();\n\npm.test(\"Ticket is open\", function () {\n    pm.expect(body.status).to.eql(\"OPEN\");\n    pm.expect(body.priority).to.eql(\"HIGH\");\n});",
        "lesson": "Why this matters: Parse the response once and reuse the parsed object. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM1-03",
        "concept": "Store extracted values only after validating they exist.",
        "text": "const body = pm.response.json();\n\npm.test(\"Token is returned\", function () {\n    pm.expect(body.token).to.be.a(\"string\").and.not.empty;\n});\n\npm.environment.set(\"accessToken\", body.token);",
        "lesson": "Why this matters: Store extracted values only after validating they exist. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM1-04",
        "concept": "Use collection or environment variables instead of hardcoded URLs.",
        "text": "const baseUrl = pm.environment.get(\"baseUrl\");\n\npm.test(\"Base URL is configured\", function () {\n    pm.expect(baseUrl).to.be.a(\"string\");\n    pm.expect(baseUrl).to.match(/^https?:\\/\\//);\n});",
        "lesson": "Why this matters: Use collection or environment variables instead of hardcoded URLs. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM1-05",
        "concept": "Assert important response headers when they are part of the contract.",
        "text": "pm.test(\"Content-Type is JSON\", function () {\n    pm.expect(pm.response.headers.get(\"Content-Type\"))\n        .to.include(\"application/json\");\n});",
        "lesson": "Why this matters: Assert important response headers when they are part of the contract. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM1-06",
        "concept": "Use a clear negative test for authentication failure.",
        "text": "pm.test(\"Invalid credentials are rejected\", function () {\n    pm.response.to.have.status(401);\n});\n\nconst body = pm.response.json();\npm.expect(body.error).to.eql(\"INVALID_CREDENTIALS\");",
        "lesson": "Why this matters: Use a clear negative test for authentication failure. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      }
    ],
    "2": [
      {
        "id": "PM2-01",
        "concept": "Validate status, structure, and correlation in one focused script.",
        "text": "const body = pm.response.json();\n\npm.test(\"Ticket was created\", function () {\n    pm.response.to.have.status(201);\n    pm.expect(body.id).to.be.a(\"number\");\n    pm.expect(body.status).to.eql(\"OPEN\");\n});\n\npm.environment.set(\"ticketId\", String(body.id));",
        "lesson": "Why this matters: Validate status, structure, and correlation in one focused script. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM2-02",
        "concept": "Use pre-request variables to generate unique test data.",
        "text": "const uniqueRef = pm.variables.replaceIn(\"{{$guid}}\");\nconst title = `Postman ticket ${uniqueRef}`;\n\npm.variables.set(\"externalRef\", uniqueRef);\npm.variables.set(\"ticketTitle\", title);\n\npm.test(\"Generated data is available\", function () {\n    pm.expect(pm.variables.get(\"externalRef\")).to.not.be.empty;\n});",
        "lesson": "Why this matters: Use pre-request variables to generate unique test data. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM2-03",
        "concept": "Parameterize requests with data variables during Collection Runner or Newman runs.",
        "text": "const username = pm.iterationData.get(\"username\");\nconst expectedStatus = Number(pm.iterationData.get(\"expectedStatus\"));\n\npm.test(`Login status for ${username}`, function () {\n    pm.expect(pm.response.code).to.eql(expectedStatus);\n});",
        "lesson": "Why this matters: Parameterize requests with data variables during Collection Runner or Newman runs. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM2-04",
        "concept": "Validate arrays and required object properties explicitly.",
        "text": "const body = pm.response.json();\n\npm.test(\"Ticket list has expected shape\", function () {\n    pm.expect(body.items).to.be.an(\"array\");\n    body.items.forEach((ticket) => {\n        pm.expect(ticket).to.include.keys(\"id\", \"title\", \"status\");\n    });\n});",
        "lesson": "Why this matters: Validate arrays and required object properties explicitly. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM2-05",
        "concept": "Keep expected negative responses as passing tests when behavior is correct.",
        "text": "pm.test(\"Employee cannot assign restricted ticket\", function () {\n    pm.expect(pm.response.code).to.eql(403);\n});\n\nconst body = pm.response.json();\npm.expect(body.error).to.eql(\"FORBIDDEN\");",
        "lesson": "Why this matters: Keep expected negative responses as passing tests when behavior is correct. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM2-06",
        "concept": "Run Newman with environment data and a machine-readable report using readable PowerShell continuation.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    --reporters cli,json `\n    --reporter-json-export reports/newman-results.json",
        "lesson": "Why this matters: Run Newman with environment data and a machine-readable report using readable PowerShell continuation. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      }
    ],
    "3": [
      {
        "id": "PM3-01",
        "concept": "Validate an API response against a JSON Schema.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"id\", \"title\", \"status\"],\n    properties: {\n        id: { type: \"integer\" },\n        title: { type: \"string\", minLength: 1 },\n        status: { enum: [\"OPEN\", \"IN_PROGRESS\", \"CLOSED\"] }\n    }\n};\n\npm.test(\"Ticket contract is valid\", function () {\n    pm.response.to.have.jsonSchema(schema);\n});",
        "lesson": "Why this matters: Validate an API response against a JSON Schema. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM3-02",
        "concept": "Fail clearly when a prerequisite environment variable is missing.",
        "text": "const token = pm.environment.get(\"accessToken\");\n\nif (!token) {\n    throw new Error(\"accessToken is not configured; run the login request first\");\n}\n\npm.request.headers.upsert({\n    key: \"Authorization\",\n    value: `Bearer ${token}`\n});",
        "lesson": "Why this matters: Fail clearly when a prerequisite environment variable is missing. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM3-03",
        "concept": "Correlate a created ID and verify it before saving it.",
        "text": "const body = pm.response.json();\n\npm.test(\"Created ticket has a usable id\", function () {\n    pm.response.to.have.status(201);\n    pm.expect(body.id).to.be.a(\"number\");\n    pm.expect(body.id).to.be.above(0);\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));",
        "lesson": "Why this matters: Correlate a created ID and verify it before saving it. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM3-04",
        "concept": "Validate pagination metadata and returned item count consistently.",
        "text": "const body = pm.response.json();\n\npm.test(\"Pagination metadata is consistent\", function () {\n    pm.expect(body.page).to.be.a(\"number\");\n    pm.expect(body.pageSize).to.be.a(\"number\");\n    pm.expect(body.items).to.be.an(\"array\");\n    pm.expect(body.items.length).to.be.at.most(body.pageSize);\n});",
        "lesson": "Why this matters: Validate pagination metadata and returned item count consistently. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM3-05",
        "concept": "Assert both authorization result and error semantics for negative access tests.",
        "text": "const body = pm.response.json();\n\npm.test(\"Restricted endpoint blocks employee role\", function () {\n    pm.response.to.have.status(403);\n    pm.expect(body.code).to.eql(\"FORBIDDEN\");\n    pm.expect(body.message).to.include(\"permission\");\n});",
        "lesson": "Why this matters: Assert both authorization result and error semantics for negative access tests. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM3-06",
        "concept": "Fail a CI-style Newman run on test failure and export JUnit output in readable PowerShell.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    --bail failure `\n    --reporters cli,junit `\n    --reporter-junit-export reports/newman-junit.xml",
        "lesson": "Why this matters: Fail a CI-style Newman run on test failure and export JUnit output in readable PowerShell. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      }
    ],
    "4": [
      {
        "id": "PM4-01",
        "concept": "Build layered assertions so failures identify the broken part of the API contract.",
        "text": "const body = pm.response.json();\n\npm.test(\"Create ticket returns HTTP 201\", function () {\n    pm.response.to.have.status(201);\n});\n\npm.test(\"Created ticket contains required fields\", function () {\n    pm.expect(body).to.include.keys(\n        \"id\",\n        \"title\",\n        \"priority\",\n        \"status\",\n        \"createdAt\"\n    );\n});\n\npm.test(\"Created ticket values are correct\", function () {\n    pm.expect(body.title).to.eql(pm.variables.get(\"ticketTitle\"));\n    pm.expect(body.priority).to.eql(\"HIGH\");\n    pm.expect(body.status).to.eql(\"OPEN\");\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));",
        "lesson": "Why this matters: Build layered assertions so failures identify the broken part of the API contract. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM4-02",
        "concept": "Use collection variables for workflow state and environment variables for environment configuration.",
        "text": "const baseUrl = pm.environment.get(\"baseUrl\");\nconst token = pm.environment.get(\"accessToken\");\nconst ticketId = pm.collectionVariables.get(\"ticketId\");\n\nif (!baseUrl) {\n    throw new Error(\"baseUrl environment variable is missing\");\n}\n\nif (!token) {\n    throw new Error(\"accessToken environment variable is missing\");\n}\n\nif (!ticketId) {\n    throw new Error(\"ticketId collection variable is missing\");\n}",
        "lesson": "Why this matters: Use collection variables for workflow state and environment variables for environment configuration. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM4-03",
        "concept": "Verify an update by checking both response values and unchanged identity fields.",
        "text": "const body = pm.response.json();\nconst expectedId = Number(\n    pm.collectionVariables.get(\"ticketId\")\n);\nconst expectedOwner = pm.collectionVariables.get(\"expectedOwner\");\n\npm.test(\"Ticket update succeeded\", function () {\n    pm.response.to.have.status(200);\n    pm.expect(body.id).to.eql(expectedId);\n    pm.expect(body.owner).to.eql(expectedOwner);\n    pm.expect(body.status).to.eql(\"IN_PROGRESS\");\n});",
        "lesson": "Why this matters: Verify an update by checking both response values and unchanged identity fields. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM4-04",
        "concept": "Use a schema to protect against silent contract regressions in nested responses.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"ticket\", \"audit\"],\n    properties: {\n        ticket: {\n            type: \"object\",\n            required: [\"id\", \"owner\", \"status\"],\n            properties: {\n                id: { type: \"integer\" },\n                owner: { type: \"string\" },\n                status: { type: \"string\" }\n            }\n        },\n        audit: {\n            type: \"object\",\n            required: [\"action\", \"timestamp\"]\n        }\n    }\n};\n\npm.test(\"Assignment contract is valid\", function () {\n    pm.response.to.have.jsonSchema(schema);\n});",
        "lesson": "Why this matters: Use a schema to protect against silent contract regressions in nested responses. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM4-05",
        "concept": "Design a negative test that proves the system rejected the operation for the right reason.",
        "text": "const body = pm.response.json();\n\npm.test(\"Restricted assignment is rejected\", function () {\n    pm.response.to.have.status(403);\n    pm.expect(body.code).to.eql(\"FORBIDDEN\");\n});\n\npm.test(\"No success payload is returned\", function () {\n    pm.expect(body).to.not.have.property(\"assignedTicket\");\n    pm.expect(body.message).to.match(/not authorized|permission/i);\n});",
        "lesson": "Why this matters: Design a negative test that proves the system rejected the operation for the right reason. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      },
      {
        "id": "PM4-06",
        "concept": "Run a repeatable Newman regression with data, environment, and machine-readable reports in PowerShell.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    -d testdata/regression_users.csv `\n    --iteration-count 1 `\n    --bail failure `\n    --reporters cli,json,junit `\n    --reporter-json-export reports/newman-results.json `\n    --reporter-junit-export reports/newman-junit.xml",
        "lesson": "Why this matters: Run a repeatable Newman regression with data, environment, and machine-readable reports in PowerShell. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid hardcoded environment values, repeated response parsing, overly broad variable scope, and status-only tests."
      }
    ]
  },
  "Mixed Testing": {
    "1": [
      {
        "id": "MIX1-01",
        "concept": "Practice a clean pytest API smoke test.",
        "text": "import os\nimport requests\n\nbase_url = os.environ[\"BASE_URL\"].rstrip(\"/\")\nresponse = requests.get(\n    f\"{base_url}/health\",\n    timeout=10,\n)\n\nassert response.status_code == 200\nassert response.json()[\"status\"] == \"ok\"",
        "lesson": "Why this matters: Practice a clean pytest API smoke test. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX1-02",
        "concept": "Practice a Selenium explicit wait.",
        "text": "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\n\nbutton = wait.until(\n    EC.element_to_be_clickable((By.ID, \"submit-ticket\"))\n)\nbutton.click()",
        "lesson": "Why this matters: Practice a Selenium explicit wait. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX1-03",
        "concept": "Practice a Postman status and field assertion.",
        "text": "const body = pm.response.json();\n\npm.test(\"Request succeeded\", function () {\n    pm.response.to.have.status(200);\n    pm.expect(body.status).to.eql(\"OPEN\");\n});",
        "lesson": "Why this matters: Practice a Postman status and field assertion. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX1-04",
        "concept": "Practice a JMeter non-GUI execution command.",
        "text": "jmeter -n   -t plans/smoke.jmx   -l results/smoke.jtl   -e -o reports/smoke",
        "lesson": "Why this matters: Practice a JMeter non-GUI execution command. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX1-05",
        "concept": "Practice safe extraction in Python.",
        "text": "body = response.json()\n\nticket_id = body.get(\"id\")\nassert ticket_id is not None\nassert isinstance(ticket_id, int)",
        "lesson": "Why this matters: Practice safe extraction in Python. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX1-06",
        "concept": "Practice Postman environment-variable access.",
        "text": "const baseUrl = pm.environment.get(\"baseUrl\");\n\nif (!baseUrl) {\n    throw new Error(\"baseUrl is not configured\");\n}",
        "lesson": "Why this matters: Practice Postman environment-variable access. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      }
    ],
    "2": [
      {
        "id": "MIX2-01",
        "concept": "Compare how Python validates an API response and extracted value.",
        "text": "def test_login_contract(api_client, valid_user):\n    response = api_client.post(\n        \"/api/login\",\n        json=valid_user,\n    )\n\n    assert response.status_code == 200\n    body = response.json()\n    assert body.get(\"token\")",
        "lesson": "Why this matters: Compare how Python validates an API response and extracted value. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX2-02",
        "concept": "Practice a Selenium Page Object method with a wait.",
        "text": "def submit(self):\n    button = self.wait.until(\n        EC.element_to_be_clickable(self.SUBMIT_BUTTON)\n    )\n    button.click()\n\n    return self.wait.until(\n        EC.visibility_of_element_located(self.SUCCESS_MESSAGE)\n    ).text",
        "lesson": "Why this matters: Practice a Selenium Page Object method with a wait. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX2-03",
        "concept": "Practice JMeter correlation and validation together.",
        "text": "def id = vars.get(\"ticketId\")\n\nif (!id || id == \"NOT_FOUND\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\"ticketId correlation failed\")\n}",
        "lesson": "Why this matters: Practice JMeter correlation and validation together. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX2-04",
        "concept": "Practice a Postman negative authorization test.",
        "text": "const body = pm.response.json();\n\npm.test(\"Restricted request is blocked\", function () {\n    pm.response.to.have.status(403);\n    pm.expect(body.code).to.eql(\"FORBIDDEN\");\n});",
        "lesson": "Why this matters: Practice a Postman negative authorization test. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX2-05",
        "concept": "Practice pytest parameterization for login outcomes.",
        "text": "import pytest\n\n@pytest.mark.parametrize(\n    \"user_fixture,expected_status\",\n    [\n        (\"valid_user\", 200),\n        (\"invalid_user\", 401),\n    ],\n)\ndef test_login(\n    api_client,\n    request,\n    user_fixture,\n    expected_status,\n):\n    credentials = request.getfixturevalue(user_fixture)\n    response = api_client.post(\"/api/login\", json=credentials)\n    assert response.status_code == expected_status",
        "lesson": "Why this matters: Practice pytest parameterization for login outcomes. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX2-06",
        "concept": "Practice a reproducible Newman run with readable PowerShell continuation.",
        "text": "newman run API.postman_collection.json `\n    -e QA.postman_environment.json `\n    --reporters cli,junit `\n    --reporter-junit-export reports/api.xml",
        "lesson": "Why this matters: Practice a reproducible Newman run with readable PowerShell continuation. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      }
    ],
    "3": [
      {
        "id": "MIX3-01",
        "concept": "Practice a realistic pytest API workflow.",
        "text": "def test_create_and_read_ticket(api_client):\n    created = api_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"VPN issue\", \"priority\": \"HIGH\"},\n    )\n    assert created.status_code == 201\n    ticket_id = created.json()[\"id\"]\n\n    fetched = api_client.get(f\"/api/tickets/{ticket_id}\")\n    assert fetched.status_code == 200\n    assert fetched.json()[\"id\"] == ticket_id",
        "lesson": "Why this matters: Practice a realistic pytest API workflow. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX3-02",
        "concept": "Practice a Selenium table verification without fixed sleeps.",
        "text": "wait.until(EC.invisibility_of_element_located((By.ID, \"loading\")))\n\nrows = driver.find_elements(By.CSS_SELECTOR, \"table tbody tr\")\nassert rows\n\nstatuses = [\n    row.find_element(By.CSS_SELECTOR, \"td.status\").text\n    for row in rows\n]\nassert \"OPEN\" in statuses",
        "lesson": "Why this matters: Practice a Selenium table verification without fixed sleeps. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX3-03",
        "concept": "Practice a JMeter unique payload with Groovy.",
        "text": "import groovy.json.JsonOutput\nimport java.util.UUID\n\ndef ref = UUID.randomUUID().toString()\ndef body = [title: \"Load test\", externalRef: ref]\n\nvars.put(\"externalRef\", ref)\nvars.put(\"requestBody\", JsonOutput.toJson(body))",
        "lesson": "Why this matters: Practice a JMeter unique payload with Groovy. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX3-04",
        "concept": "Practice a Postman schema check.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"id\", \"status\"],\n    properties: {\n        id: { type: \"integer\" },\n        status: { type: \"string\" }\n    }\n};\n\npm.test(\"Contract is valid\", function () {\n    pm.response.to.have.jsonSchema(schema);\n});",
        "lesson": "Why this matters: Practice a Postman schema check. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX3-05",
        "concept": "Practice a Selenium failure artifact pattern.",
        "text": "from pathlib import Path\n\nartifact_dir = Path(\"artifacts\")\nartifact_dir.mkdir(exist_ok=True)\n\nif \"error\" in driver.page_source.lower():\n    driver.save_screenshot(str(artifact_dir / \"unexpected_error.png\"))",
        "lesson": "Why this matters: Practice a Selenium failure artifact pattern. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX3-06",
        "concept": "Practice a parameterized JMeter run that can be repeated exactly from PowerShell.",
        "text": "jmeter -n `\n    -t plans/load_test.jmx `\n    -Jusers=25 `\n    -Jramp=60 `\n    -Jduration=180 `\n    -l results/load_25_users.jtl",
        "lesson": "Why this matters: Practice a parameterized JMeter run that can be repeated exactly from PowerShell. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      }
    ],
    "4": [
      {
        "id": "MIX4-01",
        "concept": "Practice a full API test with setup, contract checks, and negative authorization.",
        "text": "def test_assignment_permissions(admin_client, employee_client):\n    created = employee_client.post(\n        \"/api/tickets\",\n        json={\"title\": \"Payroll failure\", \"priority\": \"HIGH\"},\n    )\n    assert created.status_code == 201\n    ticket_id = created.json()[\"id\"]\n\n    denied = employee_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert denied.status_code == 403\n\n    allowed = admin_client.post(\n        f\"/api/tickets/{ticket_id}/assign\",\n        json={\"owner\": \"employee03\"},\n    )\n    assert allowed.status_code == 200\n    assert allowed.json()[\"owner\"] == \"employee03\"",
        "lesson": "Why this matters: Practice a full API test with setup, contract checks, and negative authorization. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX4-02",
        "concept": "Practice a Page Object workflow with stable locators and explicit waits.",
        "text": "class TicketDetailsPage:\n    ASSIGN_BUTTON = (By.CSS_SELECTOR, \"[data-testid='assign-ticket']\")\n    OWNER_SELECT = (By.ID, \"owner\")\n    SAVE_BUTTON = (By.CSS_SELECTOR, \"[data-testid='save-assignment']\")\n    OWNER_VALUE = (By.CSS_SELECTOR, \"[data-testid='ticket-owner']\")\n\n    def assign_to(self, owner_name):\n        assign_button = self.wait.until(\n            EC.element_to_be_clickable(self.ASSIGN_BUTTON)\n        )\n        assign_button.click()\n\n        owner_select = Select(\n            self.driver.find_element(*self.OWNER_SELECT)\n        )\n        owner_select.select_by_visible_text(owner_name)\n\n        self.driver.find_element(*self.SAVE_BUTTON).click()\n        self.wait.until(\n            EC.text_to_be_present_in_element(\n                self.OWNER_VALUE,\n                owner_name,\n            )\n        )",
        "lesson": "Why this matters: Practice a Page Object workflow with stable locators and explicit waits. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX4-03",
        "concept": "Practice a defensive JMeter assertion for expected and unexpected outcomes.",
        "text": "def code = prev.getResponseCode()\ndef body = prev.getResponseDataAsString()\ndef expected = vars.get(\"expectedStatus\") ?: \"200\"\n\nif (code != expected) {\n    AssertionResult.setFailure(true)\n\n    def sampler = prev.getSampleLabel()\n    def detail = body.take(300)\n    def message = \"Expected HTTP ${expected}, received ${code}; \" +\n        \"sampler=${sampler}; body=${detail}\"\n\n    AssertionResult.setFailureMessage(message)\n}",
        "lesson": "Why this matters: Practice a defensive JMeter assertion for expected and unexpected outcomes. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX4-04",
        "concept": "Practice a complete Postman create-and-correlate script.",
        "text": "const body = pm.response.json();\n\npm.test(\"Create request is successful\", function () {\n    pm.response.to.have.status(201);\n});\n\npm.test(\"Created resource is usable\", function () {\n    pm.expect(body.id).to.be.a(\"number\").and.above(0);\n    pm.expect(body.status).to.eql(\"OPEN\");\n    pm.expect(body.title).to.eql(pm.variables.get(\"ticketTitle\"));\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));",
        "lesson": "Why this matters: Practice a complete Postman create-and-correlate script. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX4-05",
        "concept": "Practice a clean regression execution sequence with readable commands across tools.",
        "text": "python -m pytest tests/api -q\npython -m pytest tests/ui -q\n\nnewman run API.postman_collection.json `\n    -e QA.postman_environment.json `\n    --bail failure\n\njmeter -n `\n    -t plans/final_regression.jmx `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression",
        "lesson": "Why this matters: Practice a clean regression execution sequence with readable commands across tools. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      },
      {
        "id": "MIX4-06",
        "concept": "Practice evidence-oriented automation that preserves clear failure signals.",
        "text": "def test_ticket_state_matches_ui(api_client, authenticated_driver, ticket_id):\n    api_response = api_client.get(f\"/api/tickets/{ticket_id}\")\n    assert api_response.status_code == 200\n    api_ticket = api_response.json()\n\n    page = TicketPage(authenticated_driver, ticket_id)\n    page.open()\n\n    assert page.status_text() == api_ticket[\"status\"]\n    assert page.owner_text() == api_ticket[\"owner\"]\n    assert page.title_text() == api_ticket[\"title\"]",
        "lesson": "Why this matters: Practice evidence-oriented automation that preserves clear failure signals. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Avoid duplicating the same setup across tools. Keep configuration, test data, actions, assertions, and evidence clearly separated."
      }
    ]
  },
  "Right-Hand QA Focus": {
    "1": [
      {
        "id": "RH1-01",
        "concept": "Right-hand symbol practice using a real Postman assertion.",
        "text": "pm.test(\"Status is OK\", function () {\n    pm.response.to.have.status(200);\n});",
        "lesson": "Why this matters: Right-hand symbol practice using a real Postman assertion. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH1-02",
        "concept": "Right-hand bracket practice using a Python API assertion.",
        "text": "body = response.json()\n\nassert body[\"status\"] == \"OPEN\"\nassert body[\"priority\"] == \"HIGH\"",
        "lesson": "Why this matters: Right-hand bracket practice using a Python API assertion. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH1-03",
        "concept": "Right-hand punctuation practice with a JMeter variable.",
        "text": "def ticketId = vars.get(\"ticketId\")\nassert ticketId != null",
        "lesson": "Why this matters: Right-hand punctuation practice with a JMeter variable. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH1-04",
        "concept": "Right-hand punctuation practice with a Selenium locator.",
        "text": "button = driver.find_element(\n    By.CSS_SELECTOR,\n    \"button[data-testid='login']\",\n)\nbutton.click()",
        "lesson": "Why this matters: Right-hand punctuation practice with a Selenium locator. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH1-05",
        "concept": "Right-hand number-row practice with an API timeout.",
        "text": "import os\nimport requests\n\nbase_url = os.environ[\"BASE_URL\"].rstrip(\"/\")\nresponse = requests.get(\n    f\"{base_url}/health\",\n    timeout=10,\n)\nassert response.status_code == 200",
        "lesson": "Why this matters: Right-hand number-row practice with an API timeout. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH1-06",
        "concept": "Right-hand braces practice with a Postman response object.",
        "text": "const body = pm.response.json();\nconst expectedOwner = pm.collectionVariables.get(\"expectedOwner\");\n\npm.expect(body.id).to.be.above(0);\npm.expect(body.owner).to.eql(expectedOwner);",
        "lesson": "Why this matters: Right-hand braces practice with a Postman response object. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      }
    ],
    "2": [
      {
        "id": "RH2-01",
        "concept": "Practice brackets, quotes, and periods in a realistic Postman check.",
        "text": "const body = pm.response.json();\n\npm.test(\"Priority is HIGH\", function () {\n    pm.expect(body.priority).to.eql(\"HIGH\");\n    pm.expect(body.status).to.eql(\"OPEN\");\n});",
        "lesson": "Why this matters: Practice brackets, quotes, and periods in a realistic Postman check. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH2-02",
        "concept": "Practice parentheses and selectors with an explicit Selenium wait.",
        "text": "message = wait.until(\n    EC.visibility_of_element_located(\n        (By.CSS_SELECTOR, \"[role='status']\")\n    )\n)\nassert message.text == \"Updated\"",
        "lesson": "Why this matters: Practice parentheses and selectors with an explicit Selenium wait. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH2-03",
        "concept": "Practice Groovy maps and JMeter variables.",
        "text": "def values = [\n    ticketId: vars.get(\"ticketId\"),\n    ownerId : vars.get(\"ownerId\"),\n]\n\nassert values.ticketId\nassert values.ownerId",
        "lesson": "Why this matters: Practice Groovy maps and JMeter variables. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH2-04",
        "concept": "Practice Python dictionary indexing with clear assertions.",
        "text": "result = response.json()\nexpected_owner = test_data[\"expected_owner\"]\n\nassert result[\"id\"] > 0\nassert result[\"owner\"] == expected_owner\nassert result[\"status\"] in {\"OPEN\", \"IN_PROGRESS\"}",
        "lesson": "Why this matters: Practice Python dictionary indexing with clear assertions. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH2-05",
        "concept": "Practice a symbol-heavy Newman command with readable PowerShell continuation.",
        "text": "newman run API.postman_collection.json `\n    -e QA.postman_environment.json `\n    --reporters cli,json `\n    --reporter-json-export reports/result.json",
        "lesson": "Why this matters: Practice a symbol-heavy Newman command with readable PowerShell continuation. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH2-06",
        "concept": "Practice JMeter CLI properties and paths.",
        "text": "jmeter -n   -t plans/load.jmx   -Jusers=20   -Jduration=120   -l results/load.jtl",
        "lesson": "Why this matters: Practice JMeter CLI properties and paths. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      }
    ],
    "3": [
      {
        "id": "RH3-01",
        "concept": "Practice right-hand-heavy Postman correlation code.",
        "text": "const body = pm.response.json();\n\npm.test(\"Created id is valid\", function () {\n    pm.response.to.have.status(201);\n    pm.expect(body.id).to.be.a(\"number\").and.above(0);\n});\n\npm.collectionVariables.set(\"ticketId\", String(body.id));",
        "lesson": "Why this matters: Practice right-hand-heavy Postman correlation code. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH3-02",
        "concept": "Practice nested Selenium locators and expected conditions.",
        "text": "row = wait.until(\n    EC.visibility_of_element_located(\n        (By.CSS_SELECTOR, \"table[data-testid='tickets'] tbody tr\")\n    )\n)\n\nstatus = row.find_element(By.CSS_SELECTOR, \"td.status\").text\nassert status in {\"OPEN\", \"CLOSED\"}",
        "lesson": "Why this matters: Practice nested Selenium locators and expected conditions. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH3-03",
        "concept": "Practice JMeter Groovy assertions with detailed messages.",
        "text": "def code = prev.getResponseCode()\n\nif (code != \"200\") {\n    AssertionResult.setFailure(true)\n    AssertionResult.setFailureMessage(\n        \"Expected 200, received ${code}\"\n    )\n}",
        "lesson": "Why this matters: Practice JMeter Groovy assertions with detailed messages. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH3-04",
        "concept": "Practice Python formatted strings and response validation.",
        "text": "response = api_client.get(f\"/api/tickets/{ticket_id}\")\nexpected_owner = test_data[\"expected_owner\"]\n\nassert response.status_code == 200\nbody = response.json()\nassert body[\"id\"] == ticket_id\nassert body[\"owner\"] == expected_owner",
        "lesson": "Why this matters: Practice Python formatted strings and response validation. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH3-05",
        "concept": "Practice Postman schema syntax with nested braces.",
        "text": "const schema = {\n    type: \"object\",\n    required: [\"id\", \"status\"],\n    properties: {\n        id: { type: \"integer\" },\n        status: { type: \"string\" }\n    }\n};\n\npm.response.to.have.jsonSchema(schema);",
        "lesson": "Why this matters: Practice Postman schema syntax with nested braces. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH3-06",
        "concept": "Practice a JMeter unique-reference script with punctuation and method calls.",
        "text": "import java.util.UUID\n\ndef ref = \"load-\" + UUID.randomUUID().toString()\nvars.put(\"externalRef\", ref)\n\nlog.info(\"externalRef={}\", ref)",
        "lesson": "Why this matters: Practice a JMeter unique-reference script with punctuation and method calls. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      }
    ],
    "4": [
      {
        "id": "RH4-01",
        "concept": "Long right-hand-focused Postman workflow with best-practice assertions.",
        "text": "const body = pm.response.json();\nconst expectedOwner = pm.collectionVariables.get(\"expectedOwner\");\n\npm.test(\"Assignment succeeded\", function () {\n    pm.response.to.have.status(200);\n    pm.expect(body.ticket.id).to.be.a(\"number\").and.above(0);\n    pm.expect(body.ticket.owner).to.eql(expectedOwner);\n    pm.expect(body.ticket.status).to.eql(\"IN_PROGRESS\");\n});\n\npm.test(\"Audit information exists\", function () {\n    pm.expect(body.audit.action).to.eql(\"ASSIGNED\");\n    pm.expect(body.audit.timestamp).to.be.a(\"string\").and.not.empty;\n});",
        "lesson": "Why this matters: Long right-hand-focused Postman workflow with best-practice assertions. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH4-02",
        "concept": "Long right-hand-focused Selenium Page Object method.",
        "text": "def assign_to(self, owner_name):\n    self.wait.until(\n        EC.element_to_be_clickable(self.ASSIGN_BUTTON)\n    ).click()\n\n    owner = Select(\n        self.driver.find_element(*self.OWNER_SELECT)\n    )\n    owner.select_by_visible_text(owner_name)\n\n    self.driver.find_element(*self.SAVE_BUTTON).click()\n\n    self.wait.until(\n        EC.text_to_be_present_in_element(\n            self.OWNER_VALUE,\n            owner_name,\n        )\n    )",
        "lesson": "Why this matters: Long right-hand-focused Selenium Page Object method. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH4-03",
        "concept": "Long right-hand-focused JMeter validation script.",
        "text": "import groovy.json.JsonSlurper\n\ndef text = prev.getResponseDataAsString()\ndef json = new JsonSlurper().parseText(text)\n\ndef checks = [\n    id      : json.id,\n    owner   : json.owner,\n    priority: json.priority,\n]\n\nchecks.each { key, value ->\n    if (value == null) {\n        AssertionResult.setFailure(true)\n        AssertionResult.setFailureMessage(\"Missing response field: ${key}\")\n    }\n}",
        "lesson": "Why this matters: Long right-hand-focused JMeter validation script. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH4-04",
        "concept": "Long right-hand-focused Python API verification.",
        "text": "def test_ticket_owner_and_priority(\n    api_client,\n    ticket_id,\n    expected_owner,\n):\n    response = api_client.get(f\"/api/tickets/{ticket_id}\")\n\n    assert response.status_code == 200\n    body = response.json()\n    assert body[\"id\"] == ticket_id\n    assert body[\"owner\"] == expected_owner\n    assert body[\"priority\"] in {\"HIGH\", \"MEDIUM\", \"LOW\"}",
        "lesson": "Why this matters: Long right-hand-focused Python API verification. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH4-05",
        "concept": "Long symbol practice using a readable and reproducible Newman PowerShell command.",
        "text": "newman run ServiceDesk.postman_collection.json `\n    -e Competition.postman_environment.json `\n    -d testdata/users.csv `\n    --bail failure `\n    --reporters cli,json,junit `\n    --reporter-json-export reports/results.json `\n    --reporter-junit-export reports/results.xml",
        "lesson": "Why this matters: Long symbol practice using a readable and reproducible Newman PowerShell command. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
      },
      {
        "id": "RH4-06",
        "concept": "Long symbol practice using a readable parameterized JMeter PowerShell command.",
        "text": "jmeter -n `\n    -t plans/final_regression.jmx `\n    -Jusers=$env:JMETER_USERS `\n    -Jramp=$env:JMETER_RAMP_SECONDS `\n    -Jduration=$env:JMETER_DURATION_SECONDS `\n    -JbaseUrl=$env:BASE_URL `\n    -l results/final_regression.jtl `\n    -e `\n    -o reports/final_regression",
        "lesson": "Why this matters: Long symbol practice using a readable parameterized JMeter PowerShell command. After typing it, identify the setup, action, assertion, and cleanup responsibilities.",
        "avoid": "Accuracy comes first. Type the testing pattern correctly before trying to increase speed."
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
