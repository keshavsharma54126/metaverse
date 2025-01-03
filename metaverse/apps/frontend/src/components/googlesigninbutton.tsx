import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


const GoogleLoginButton = () => {
  const navigate = useNavigate()
  return (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        if (!credentialResponse.credential) {
          console.error('No credential received from Google');
          return;
        }
        const decoded = jwtDecode(credentialResponse.credential);
        try{
          const response = await axios.post(import.meta.env.VITE_BACKEND_URL+"/google-signin",{
            decoded
          })
          const token = response.data.token
          localStorage.setItem("authToken",token)
          navigate("/dashboard")
        }catch(e){
          console.log(e)
        }
        
        
      }}
      onError={() => console.log('Login Failed')}
    />
  </GoogleOAuthProvider>
);
}

export default GoogleLoginButton;
