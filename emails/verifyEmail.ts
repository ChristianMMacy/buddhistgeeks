import * as postmark from 'postmark'

export default async (email:string, vars:{activation_code:string, name: string, activation_url: string}) => {
  var client = new postmark.ServerClient(process.env.POSTMARK_TOKEN || '');
  await client.sendEmailWithTemplate({
    From: 'accounts@hyperlink.academy',
    To: email,
    TemplateAlias: "welcome",
    TemplateModel: vars
  })
}