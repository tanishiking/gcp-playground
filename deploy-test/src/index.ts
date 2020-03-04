import { Context } from '@google-cloud/functions-framework'

export const test = async (message: any, context: Context): Promise<void> => {
    console.log("hello")
    return
}
