

const Assignment = () => {
  return (
   <main className="flex flex-col  border border-black gap-2 p-2 h-screen w-full">
    
      <div className="flex h-[calc(100vh-50px)] gap-2">
          <div className="flex flex-row gap-x-4 w-screen">
          <div className="border border-black w-2/3">
              Screen share
          </div>
          <div className="flex flex-col w-1/3 gap-2">
            <div className="border border-black h-1/3">
                video
            </div>
            <div className="border border-black  h-2/3">
                chat section
            </div>
          </div>
          </div>
      </div>
    <div className="h-50px  p-4 border border-black "> controls</div>
   </main>
  )
}

export default Assignment
