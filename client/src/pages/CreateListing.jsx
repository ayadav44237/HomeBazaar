import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react'
import { app } from '../../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {

    const [files,setFile] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls:[],
        name:'',
        description: '',
        address: '',
        type: 'rent',
        bedrooms:1,
        bathrooms:1,
        regularPrice: 0,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    })
    const {currentUser} = useSelector((state)=> {
        console.log(state)
        return state.user.user})
    const [imageUploadError, seIimageUploadError] = useState("");
    const [upload, setUpload] = useState(false);
    const [error, setError]  = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    console.log(currentUser,"currentuser");
    const handleImageSubmit = ()=>{
        // e.preventDefault();
        try{
        setUpload(true);
        if(files.length>0 && files.length<7){
            const promises = [];
            for(let i=0;i<files.length;i++){
                promises.push(storeImage(files[i]));
            }

            Promise.all(promises).then((urls)=>{
                setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)})
            })
        }
    }
    catch(err)
    {
        seIimageUploadError(err);
    }
        setUpload(false);

    }

    const handleRemoveImage = (index)=>{
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((ele,ind)=>ind!=index)
        })
    }

    const storeImage = async(file)=>{
        return new Promise((resolve, reject)=>{
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage,fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                "state_changed",
                (snapshot)=>{
                    const progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`)
                },
                (err)=>{
                    reject(err)
                },
                ()=>{
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                        resolve(downloadURL);
                    })
                }
            )

        })
    }

    console.log(formData,"formData")

    const handleChange = (e)=>{
        if(e.target.id === 'sale' || e.target.id === 'rent'){
            setFormData({
                ...formData,
                type: e.target.id
            })
        }

        if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            })
        }

        if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea'){
            setFormData({
                ...formData,
                [e.target.id]:e.target.value
            })
        }
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            if(formData.imageUrls.length < 1)
                return setError('You must upload atleast one image');
            if(+formData.regularPrice<+formData.discountPrice)
                return setError('Discount price must be lower than regular price');

            setLoading(true);
            setError(false);
            const res = await fetch('/api/listing/create',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                userRef: currentUser._id
            })
            });

            const data = await res.json();
            setLoading(false);
            if(data.success===false){
                setError(data.message);
                return;
            }
            navigate(`/listing/${data._id}`)
        }
        catch(error){
            setError(error.message);
            setLoading(false);
        }
    }

  return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>
            Create a Listing
        </h1>
        <form className='flex flex-col sm:flex-row gap-4' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-4 flex-1'>
                <input onChange={handleChange} value={formData.name} type='text' placeholder='Name' className='border p-3 rounded-lg' id='name' maxLength='62' minLength='5' required />
                <textarea onChange={handleChange} value={formData.description} type='text' placeholder='Description' className='border p-3 rounded-lg' id='description'  required />
                <input onChange={handleChange} value={formData.address} type='text' placeholder='Address' className='border p-3 rounded-lg' id='address' required />
                <div className='flex flex-wrap gap-6'>
                    <div className='flex gap-2'>
                        <input type='checkbox' id='sale' className='w-5' onChange={handleChange} checked={formData.type === 'sale'}/>
                        <span>Sell</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type='checkbox' id='rent' className='w-5' onChange={handleChange} checked={formData.type === 'rent'} />
                        <span>Rent</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type='checkbox' id='parking' className='w-5' onChange={handleChange} checked={formData.parking === true}/>
                        <span>Parking Spot</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type='checkbox' id='furnished' className='w-5' onChange={handleChange} checked={formData.furnished === true}/>
                        <span>Furnished</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type='checkbox' id='offer' className='w-5' onChange={handleChange} checked={formData.offer === true} />
                        <span>Offer</span>
                    </div>
                </div>
                <div className='flex flex-wrap gap-6'>
                    <div className='flex items-center gap-2'>
                        <input onChange={handleChange} value={formData.bedrooms} type='number' id='bedrooms' min='1' max='10'  required className='p-3 border border-gray-300 rounded-lg' />
                        <p>Beds</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input onChange={handleChange} value={formData.bathrooms} type='number' id='bathrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg' />
                        <p>Baths</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input onChange={handleChange} value={formData.regularPrice} type='number' id='regularPrice' min='50' max='100000'  required className='p-3 border border-gray-300 rounded-lg' />
                        <div className='flex flex-col item-center gap-2'>
                            <p>Regular Price</p>
                            <span className='text-xs'>($ / Month)</span>
                        </div>   
                    </div>
                    {formData.offer && (<div className='flex items-center gap-2'>
                        <input onChange={handleChange} value={formData.discountPrice} type='number' id='discountPrice' min='0' max='100'  required className='p-3 border border-gray-300 rounded-lg' />
                        <div className='flex flex-col item-center gap-2'>
                            <p>Discounted Price</p>
                            <span className='text-xs'>($ / Month)</span>
                        </div>
                    </div>)} 
                </div>
            </div>
            <div className='flex flex-col flex-1 gap-4'>
                <p className='font-semibold'>Images:
                    <span className='font-normal text-gray-600 ml-2'>The first image will be the cover image (max 6)</span>
                </p>
                <div className=' flex gap-4'>
                    <input onChange={(e)=>setFile(e.target.files)} type='file' id='images' accept='images/*' multiple  className='p-3 border border-gray-300 rounded w-full'/>
                    <button disabled={upload} onClick={handleImageSubmit} type='button' className='p-3 text-green-700 border border-green-700 uppercase rounded hover:shadow-lg disabled:opacity-80'>{upload ? 'Uploading...':'Upload'}</button>
                </div>
                <p className='text-red-500'>{imageUploadError && imageUploadError}</p>
                {
                    formData.imageUrls.length>0 && formData.imageUrls.map((url, index) => (
                       <div key={url} className='flex justify-between p-3 border items-center'> 
                            <img src={url} alt='listing image' className='w-40 h-40 object-contain rounded-lg'/>
                            <button onClick={()=>handleRemoveImage(index)} type='button' className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>Delete</button>
                       </div>
                    ))
                }
                <button disabled={loading || upload} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Creating...':'Create Listing'}</button>
                {error && <p className='text-red-700 text-sm'>{error}</p>}
            </div>
           
        </form>
    </main>
  )
}

export default CreateListing