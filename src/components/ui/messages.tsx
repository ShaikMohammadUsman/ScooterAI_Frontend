import { TiTick } from "react-icons/ti"
import { HiOutlineExclamation } from "react-icons/hi"

export const FormFailure = ({ message }: { message: string }) => {
    if (!message) return null
    return (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive my-2">
            <HiOutlineExclamation className="h-5 w-5" />
            <h2>{message}</h2>
        </div>
    )
}

export const FormSuccess = ({ message }: { message: string }) => {
    if (!message) return null
    return (
        <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 my-2">
            <TiTick className="h-5 w-5" />
            <h2>{message}</h2>
        </div>
    )
}