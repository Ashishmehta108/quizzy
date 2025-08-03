import fs from "fs"
export async function readFile(file_path) {
    let d = ""
    const fileContent = await fs.readFile(file_path, (err, data) => {
        d = data
    })
    return d
}