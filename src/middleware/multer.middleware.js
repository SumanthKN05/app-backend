import multer from 'multer';

const storage= multer.diskStorage/*multer.diskStorage() – Defines Storage Settings*/({
  destination:function (req,file,cb){
    cb(null,'./public/temp');
  },
  
/*destination:Defines the folder (./public/temp) where uploaded files will be saved.
The callback function cb(null, './public/temp') tells Multer where to store the file.
filename:Defines the filename for the uploaded file.
file.originalname keeps the original file name.*/

  filename:function (req,file,cb){
    cb(null,file.originalname);
  }
})

export const upload=multer({storage})
//This creates an upload middleware that can be used in routes to handle file uploads.
//upload is now an instance of Multer, configured to store files on disk.
