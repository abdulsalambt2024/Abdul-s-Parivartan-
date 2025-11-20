import React, { useState, useEffect } from 'react';
import { Post, User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { Heart, MessageCircle, Share2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

interface FeedProps {
  currentUser: User | null;
  onLoginRequest: () => void;
}

export const Feed: React.FC<FeedProps> = ({ currentUser, onLoginRequest }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<Post['type']>('general');
  
  // Image Upload & Crop
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    setPosts(storageService.getPosts());
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = () => {
              setSelectedImageFile(reader.result as string);
              setIsCropping(true);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleCreateClick = () => {
      if (!currentUser) {
          onLoginRequest();
          return;
      }
      setIsCreating(true);
  }

  const handleCreatePost = () => {
    if (!currentUser) return;
    if (!newPostContent.trim() && !croppedImage) return;
    
    if (currentUser.role === UserRole.USER) {
        alert("Please request an upgrade to Member status to create posts.");
        return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar || '',
      type: newPostType,
      content: newPostContent,
      image: croppedImage || undefined,
      likes: 0,
      comments: [],
      timestamp: Date.now(),
    };

    const updatedPosts = storageService.savePost(newPost);
    setPosts(updatedPosts);
    setIsCreating(false);
    setNewPostContent('');
    setCroppedImage(null);
    setSelectedImageFile(null);
  };

  const handleLike = (postId: string) => {
    if (!currentUser) {
        onLoginRequest();
        return;
    }
    const updatedPosts = posts.map(p => {
      if (p.id === postId) return { ...p, likes: p.likes + 1 };
      return p;
    });
    setPosts(updatedPosts);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
       {/* Create Post Trigger */}
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
         <div className="flex items-center gap-3 cursor-pointer" onClick={handleCreateClick}>
             <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                <img src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="Me" className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-gray-500 hover:bg-gray-100 transition text-sm">
                 {currentUser ? `Share something with Parivartan, ${currentUser.name.split(' ')[0]}...` : 'Sign in to share with the community...'}
             </div>
             <button className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20">
                <ImageIcon size={20} />
             </button>
         </div>
       </div>

       {/* Cropper Modal */}
       {isCropping && selectedImageFile && (
           <ImageCropper 
             imageUrl={selectedImageFile}
             onCrop={(img) => { setCroppedImage(img); setIsCropping(false); }}
             onCancel={() => { setIsCropping(false); setSelectedImageFile(null); }}
           />
       )}

       {/* Create Post Modal */}
       {isCreating && !isCropping && currentUser && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-semibold text-gray-800">Create New Post</h3>
               <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
             </div>
             <div className="p-4">
               <div className="flex gap-2 mb-4">
                 {['general', 'achievement', 'announcement'].map((t) => (
                   <button 
                     key={t}
                     onClick={() => setNewPostType(t as Post['type'])}
                     className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${newPostType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
               <textarea
                 value={newPostContent}
                 onChange={(e) => setNewPostContent(e.target.value)}
                 placeholder="What's on your mind?"
                 className="w-full h-32 resize-none outline-none text-gray-700 text-lg placeholder-gray-400"
               />
               
               {croppedImage ? (
                   <div className="relative mt-2">
                       <img src={croppedImage} alt="Upload" className="w-full h-48 object-cover rounded-lg" />
                       <button 
                         onClick={() => { setCroppedImage(null); setSelectedImageFile(null); }} 
                         className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"
                       >
                           <X size={16} />
                       </button>
                   </div>
               ) : (
                <div className="mt-2">
                   <label className="h-12 w-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:border-primary hover:text-primary cursor-pointer transition">
                        <ImageIcon size={20} />
                        <span className="text-sm font-medium">Add Photo</span>
                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                   </label>
                </div>
               )}
             </div>
             <div className="p-4 border-t border-gray-100 flex justify-end">
               <button 
                 onClick={handleCreatePost}
                 className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
               >
                 Post
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Feed List */}
       <div className="space-y-6">
         {posts.map(post => (
           <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
             <div className="p-4 flex items-center gap-3">
               <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
               <div>
                 <h4 className="font-semibold text-gray-900 text-sm">{post.userName}</h4>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {Math.floor((Date.now() - post.timestamp) / 60000)}m ago
                    </span>
                    {post.type !== 'general' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${post.type === 'achievement' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {post.type}
                        </span>
                    )}
                 </div>
               </div>
             </div>
             
             <div className="px-4 pb-3">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p>
             </div>

             {post.image && (
               <div className="w-full bg-gray-100">
                 <img src={post.image} alt="Post Content" className="w-full h-auto max-h-[500px] object-contain" />
               </div>
             )}

             <div className="p-3 flex items-center gap-6 border-t border-gray-50 mt-1">
               <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition group">
                 <Heart size={20} className={`group-hover:scale-110 transition-transform ${post.likes > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                 <span className="font-medium text-sm">{post.likes}</span>
               </button>
               <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition">
                 <MessageCircle size={20} />
                 <span className="font-medium text-sm">{post.comments.length}</span>
               </button>
               <button className="ml-auto text-gray-400 hover:text-gray-600">
                 <Share2 size={20} />
               </button>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};