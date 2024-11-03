import axios2 from "axios";
const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";

const axios ={
    post: async (...args)=>{
        try{
            const res = axios2.post(...args)
            return res
        }catch(e){
            return e.response
        }
    },
    get:async (...args)=>{
        try{
            const res = axios2.get(...args)
            return res
        }catch(e){
            return e.response
        }
    },
    put:async (...args)=>{
        try{
            const res = axios2.put(...args)
            return res
        }catch(e){
            return e.response
        }
    },
    delete:async (...args)=>{
        try{
            const res = axios2.delete(...args)
            return res
        }catch(e){
            return e.response
        }
    }
}

describe("Authentication",()=>{
    test("user is able to signup only once",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/signup`,{
            useranme,
            passowrd,
            type:"admin"
        })
        expect(res.status).toBe(200)
        const updatedRes = await axios.post(`${BACKEND_URL}/signup`,{
            useranme,
            passowrd,
            type:"admin"
        })
        expect(updatedRes.status).toBe(400)
    })
    test("Signup request fails if username is not provided",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/signup`,{
            password,
            type:"admin"
        })
        expect(res.status).toBe(400)
    })
    test("Signin successfull if username and password are correct",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/signin`,{
            username,
            password
        })
        expect(res.status).toBe(200)
        expect(res.data.token).toBeDefined()
    })
    test("Signin fails if the username and password are incorrect",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/signin`,{
            username:'wrongusername',
            password
        })
        expect(res.status).toBe(400)
        const updatedRes = await axios.post(`${BACKEND_URL}/signin`,{
            username,
            password:'wrongpassword'
        })
        expect(updatedRes.status).toBe(400)
    })

})