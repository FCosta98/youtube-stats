export default function Login() {

    const handleLogin = async () => {
        try {

          window.location.href = "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=1070126863055-ltv5ll8s7oogjoh1v6r5164f4cd85u6d.apps.googleusercontent.com&scope=openid%20profile%20email&access_type=offline&redirect_uri=http://localhost:3000/callback";
        
        } catch (error) {
          console.error('Error logging in:', error);
        }
      };

    return (
        <div>
          <h1>Login Page</h1>
          <button onClick={handleLogin}>Login with Google</button>
        </div>
    )
}