import {useState} from "react"
import jwt from "jsonwebtoken"

export const useAuthentication = ()=>{
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    
    try {
        const token = localStorage.getItem('authToken')
        const jwtToken = token?.split(" ")[1];
        if (token && jwtToken) {
            const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || '')
            if(decoded){
                setIsAuthenticated(true)
                setLoading(false)
            }
            
        } else {
            setIsAuthenticated(false)
            setLoading(true)
        }

        return [loading,isAuthenticated]
    } catch(e) {
        console.error(e, "failed to check if user is signedIn or not")
        setIsAuthenticated(false)
    }
}