import { Context } from '@google-cloud/functions-framework'

export const appTest = async (message: any, context: Context): Promise<void> => {
    console.log("hello")
    return
}
