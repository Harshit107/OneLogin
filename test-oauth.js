
const testClientRegistration = async () => {
    try {
        const response = await fetch("http://localhost:5000/oauth/register-client", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-secret": "super_secret_admin_key"
            },
            body: JSON.stringify({
                app_name: "Test App",
                redirect_uris: ["http://localhost:3000/callback"],
                allowed_scopes: ["read_user"]
            })
        });
        const data = await response.json();
        console.log("Register Client Response:", data);
        return data;
    } catch(err) {
        console.error("Register Error:", err);
    }
}

const testLogin = async () => {
    try {
        const response = await fetch("http://localhost:5000/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "testuser1@example.com",
                password: "password123"
            })
        });
        
        // This won't work perfectly unless we mock the user in the database first.
        const data = await response.json();
        const cookie = response.headers.get('set-cookie');
        console.log("Login Cookie:", cookie);
        console.log("Login Response:", data);
        return { data, cookie };
    } catch (err) {
        console.error("Login Error:", err);
    }
}

const runTests = async () => {
   console.log("Running Tests...");
   const clientData = await testClientRegistration();
}

runTests();
