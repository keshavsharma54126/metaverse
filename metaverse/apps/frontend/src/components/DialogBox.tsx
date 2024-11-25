import { Button } from "./Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog"
import { Input } from "./Input"
import { Label } from "./Label"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import axios from "axios"

export function DialogBox({maps,userId}:{maps:any,userId:string}) {
  const [spaceName, setSpaceName] = useState("")
  const [spaceDescription, setSpaceDescription] = useState("")
  const [capacity, setCapacity] = useState(10)
  const [mapId, setMapId] = useState("")
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const handleCreateSpace = async()=>{
   try{
    const token = localStorage.getItem("authToken")
    const res = await axios.post(`${BACKEND_URL}/space`,{
        name:spaceName,description:spaceDescription,capacity:capacity,adminId:userId,mapId:mapId,
      },{
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        }
      })
      console.log(res.data)
      setSpaceName("")
      setSpaceDescription("")
      setCapacity(10)
      setMapId("")
      window.location.reload()
   }catch(err){
    console.log(err)
   }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="text-lg text-white">Create New Space</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-violet-500 w-2 h-8 rounded-full" />
            Create New Space
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create your own virtual space in the metaverse. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">
              Space Name
            </Label>
            <Input
              id="name"
              placeholder="Tech Hub Campus"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-violet-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Input
              id="description"
              placeholder="A virtual space for tech enthusiasts..."
              value={spaceDescription}
              onChange={(e) => setSpaceDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-violet-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity" className="text-white">
              Max Capacity
            </Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-violet-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="map" className="text-white">
              Map
            </Label>
            <Select onValueChange={(value)=>{
                setMapId(value)
                console.log(mapId)
            }}>
              <SelectTrigger className="hover:bg-gray-700 rounded-md px-2 py-1 text-white">
                <SelectValue className="text-white cursor-pointer hover:bg-gray-700 rounded-md px-2 py-1"  placeholder="Select a map" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800">
                {maps?.map((map:any)=>(
                  <SelectItem onSelect={()=>{
                  }} className="text-white bg-gray-800 cursor-pointer" key={map.id} value={map.id}>{map.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreateSpace}
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Create Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
