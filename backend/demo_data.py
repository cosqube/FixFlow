from schemas import DiagnosisResponse, Cause, Action

DEMO_SCENARIOS = {
    "local_application": DiagnosisResponse(
        problem="Connection refused to local service",
        category="LOCAL APPLICATION",
        severity="MEDIUM",
        confidence=87,
        evidence=[
            "ECONNREFUSED",
            "localhost:8000",
            "connection refused error message visible"
        ],
        possible_causes=[
            Cause(cause="Backend service is unavailable or stopped.", likelihood="HIGH"),
            Cause(cause="Incorrect port specified in configuration.", likelihood="MEDIUM"),
            Cause(cause="Local firewall blocking connections.", likelihood="LOW")
        ],
        diagnosis="The application is unable to reach the local backend. A connection attempt to localhost on port 8000 was actively refused by the target machine, which typically means no service is listening on that port.",
        recommended_actions=[
            Action(
                title="CHECK THE BACKEND", 
                description="Confirm the backend service is running.", 
                expected_result="Service responds on port 8000."
            ),
            Action(
                title="VERIFY THE PORT", 
                description="Check that the application and backend use the same port.", 
                expected_result="Configurations match on both ends."
            ),
            Action(
                title="RETRY", 
                description="Restart the application and reconnect.", 
                expected_result="Connection establishes successfully."
            )
        ],
        warnings=[
            "Do not delete configuration files yet. They may contain environment settings required by the application.",
            "Recommended approach: inspect → verify → modify"
        ],
        simple_explanation="The app is trying to connect to a backend server on port 8000, but nothing is running there.",
        technical_explanation="A TCP connection to localhost:8000 failed with ECONNREFUSED. This indicates the OS network stack actively rejected the connection because no process is listening on that port.",
        ide_agent_instructions="1. Check the run configuration for the backend service.\n2. Execute `lsof -i :8000` to verify port availability.\n3. Create a bash script to start the backend using uvicorn on port 8000.",
        escalation_conditions=["If backend is verified running but issue persists", "If other local services are also failing"]
    ),
    "network": DiagnosisResponse(
        problem="Connected without internet access",
        category="NETWORK",
        severity="HIGH",
        confidence=92,
        evidence=[
            "Wi-Fi icon shows exclamation mark",
            "'No Internet' status in network panel",
            "Failed ping to 8.8.8.8"
        ],
        possible_causes=[
            Cause(cause="Router has lost upstream connection to ISP.", likelihood="HIGH"),
            Cause(cause="DNS resolution failure.", likelihood="MEDIUM"),
            Cause(cause="Captive portal blocking access.", likelihood="LOW")
        ],
        diagnosis="The device is successfully connected to the local network (LAN) but cannot reach the broader internet (WAN). The gateway is reachable but downstream routing or DNS is failing.",
        recommended_actions=[
            Action(
                title="RESTART ROUTER", 
                description="Power cycle the local router and modem.", 
                expected_result="Router re-establishes ISP lease."
            ),
            Action(
                title="CHECK DNS", 
                description="Attempt to ping a public IP directly (e.g., 8.8.8.8) to isolate DNS failure.", 
                expected_result="Ping succeeds, indicating DNS issue."
            )
        ],
        warnings=[
            "Do not forget current network credentials before restarting.",
            "Avoid resetting network adapters until physical infrastructure is verified."
        ],
        simple_explanation="Your computer is talking to your Wi-Fi router, but the router isn't talking to the internet.",
        technical_explanation="Layer 2 connectivity is established and a local IP is assigned, but Layer 3 routing beyond the default gateway is dropping packets.",
        ide_agent_instructions="1. Run `ping 8.8.8.8` to check raw connectivity.\n2. Run `nslookup google.com` to check DNS.\n3. Output results to a network_diag.txt file.",
        escalation_conditions=["If router restart fails", "If multiple devices show the same symptom"]
    ),
    "configuration": DiagnosisResponse(
        problem="Missing environment variable",
        category="CONFIGURATION",
        severity="CRITICAL",
        confidence=95,
        evidence=[
            "KeyError: 'DATABASE_URL'",
            "Stack trace points to config.py line 42",
            "Application startup crash"
        ],
        possible_causes=[
            Cause(cause=".env file is missing or not loaded.", likelihood="HIGH"),
            Cause(cause="Typo in the environment variable name.", likelihood="MEDIUM"),
            Cause(cause="Deployment environment is missing secret injection.", likelihood="MEDIUM")
        ],
        diagnosis="The application failed to start because it attempted to access a required environment variable ('DATABASE_URL') that is not present in the execution environment.",
        recommended_actions=[
            Action(
                title="VERIFY .ENV FILE", 
                description="Check if the .env file exists in the project root.", 
                expected_result=".env file is present and readable."
            ),
            Action(
                title="CHECK VARIABLE EXPORT", 
                description="Run 'echo $DATABASE_URL' in the terminal to see if it's exported.", 
                expected_result="The correct connection string is printed."
            ),
            Action(
                title="UPDATE CONFIG", 
                description="Add the missing variable to the environment configuration.", 
                expected_result="Application starts without KeyError."
            )
        ],
        warnings=[
            "Do not commit .env files or raw secrets to version control.",
            "Ensure the database URL does not contain production credentials in a local development environment."
        ],
        simple_explanation="The program needs a specific piece of information (like a password or address) to start, but it can't find it.",
        technical_explanation="The runtime environment lacks a required key-value pair in os.environ. The application lacks a fallback or default value, resulting in an unhandled KeyError during initialization.",
        ide_agent_instructions="1. Search the codebase for `os.environ.get('DATABASE_URL')` or similar.\n2. Create a `.env` file in the root if it doesn't exist.\n3. Add `DATABASE_URL=sqlite:///./test.db` to the `.env` file.\n4. Ensure python-dotenv is loaded in main.py.",
        escalation_conditions=["If variable is confirmed present but still not read", "If other variables are also missing"]
    )
}

