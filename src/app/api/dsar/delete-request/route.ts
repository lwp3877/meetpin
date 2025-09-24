export async function GET(){return Response.json({pending:false});}
export async function POST(){return Response.json({requested:true},{status:201});}
export async function DELETE(){return Response.json({cancelled:true});}
export const dynamic='force-dynamic';