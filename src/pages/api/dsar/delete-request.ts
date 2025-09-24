export default (req,res)=>{
  if(req.method==='GET') return res.status(200).json({pending:false});
  if(req.method==='POST') return res.status(201).json({requested:true});
  if(req.method==='DELETE') return res.status(200).json({cancelled:true});
  res.setHeader('Allow','GET,POST,DELETE'); return res.status(405).end();
};