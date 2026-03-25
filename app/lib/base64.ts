export const getBase64Image = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer).toString("base64")
}

export const prepareImage = async (): Promise<string> => {
  return await getBase64Image("https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg")
}
