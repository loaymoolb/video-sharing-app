import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineClose } from 'react-icons/ai';
import { BsFillPlayFill } from 'react-icons/bs';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import axios from 'axios';
import { BASE_URL } from '../../utils';
import { Video } from '../../types';
import useAuthStore from '../../store/authStore';

import Comments from '../../components/Comments';
import LikeButton from '../../components/LikeButton';

interface IProps {
  postDetails: Video,
}

const Detail = ({ postDetails } : IProps ) => {
  const [post, setPost] = useState(postDetails);
  const [playing, setPlaying] = useState(false); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const router = useRouter();
  const {userProfile}: any = useAuthStore();
  const [comment, setComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const onVideoClick = () => {
    if(playing) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      videoRef.current?.play();
      setPlaying(true);
    }
  }

  useEffect(() => {
    if(post && videoRef?.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [post, isVideoMuted])

  const handleLike = async (like : boolean) => {
    if(userProfile) {
      const { data } = await axios.put(`${BASE_URL}/api/like`, {
        userId: userProfile._id,
        postId: post._id,
        like
      })

      setPost({ ...post, likes: data.likes });
    }
  }

  const addComment = async (e) => {
    e.preventDefault();

    if (userProfile) {
      if (comment) {
        setIsPostingComment(true);
        const res = await axios.put(`${BASE_URL}/api/post/${post._id}`, {
          userId: userProfile._id,
          comment,
        });

        setPost({ ...post, comments: res.data.comments });
        setComment('');
        setIsPostingComment(false);    
      }
    }
  }

  if(!post) return null;

  return (
    <div className="flex w-full absolute left-0 top-0 bg-white flex-wrap lg:flex-nowrap">
      <div className="relative flex-2 w-[1000px] lg:w-9/12 flex justify-center items-center bg-blurred-img bg-no-repeat bg-cover bg-center">
        <div className="opacity-90 absolute top-6 left-2 lg:left-6 flex gap-6 z-50">
          <p className="cursor-pointer" onClick={() => router.back()}>
            <AiOutlineClose className="text-white text-[35px]"/>
            </p>
        </div>
        <div className="relative">
          <div className="lg:h-[100vh] h-[60vh]">
            <video
              ref={videoRef}
              loop
              onClick={onVideoClick}
              src={post.video.asset.url}
              className="h-full cursor-pointer"
            >
            </video>
          </div>
          <div className="absolute top-[45%] left-[45%] cursor-pointer">
            {!playing && (
              <button
                onClick={onVideoClick}
              >
                <BsFillPlayFill
                  className="text-white text-6xl lg:text-8xl"
                />
              </button> 
            )}
          </div>          
        </div>
        <div className="absolute bottom-10 lg:bottom-10 right-5 lg:right-10 cursor-pointer">
        {isVideoMuted ? (
          <button
            onClick={() => setIsVideoMuted(false)}
          >
            <HiVolumeOff
            className="text-white text-3xl lg:text-4xl"/>
          </button>
        ) : (
          <button
          onClick={() => setIsVideoMuted(true)}
          >
            <HiVolumeUp
            className="text-white text-3xl lg:text-4xl"/>
          </button>
        )}
        </div>
      </div>
      <div className="relative w-[1000px] md:w-[900px] lg:[700px]">
          <div className="lg:mt-20 mt-10">  
            <div className="flex gap-3 p-2 cursor-pointer font-semibold rounded">
              <div className="ml-4 md:w-16 md:h-16 w-14 h-14">
                <Link href="/">
                  <>
                  <Image
                    width={62}
                    height={62} 
                    className="rounded-full"
                    src={post.postedBy?.image}
                    alt="user-profile"
                    layout="responsive"
                  />
                  </>
                </Link>
              </div>
              <div>
                <Link href="/">
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    <p className="flex gap-2 items-center md:text-md font-bold text-primary lowercase cursor-pointer">
                      {post.postedBy.userName.replaceAll(' ', '')}{` `}
                    </p>
                    <p className="capitalize font-medium text-xs text-gray-500 md:block">
                      {post.postedBy.userName}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
            <p className="px-6 md:ml-[4.6rem] ml-0 text-lg text-gray-600">{post.caption}</p>
            <div className="mt-10 px-[1.75rem]">
              {userProfile && (
                <LikeButton 
                  likes={post.likes}
                  handleLike={() => handleLike(true)}                  handleDislike={() => handleLike(false)}
                />
              )}
            </div>
            <Comments
              comment={comment}
              setComment={setComment}
              addComment={addComment}
              isPostingComment={isPostingComment}
              comments={post.comments}
            />
          </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const res = await axios.get(`${BASE_URL}/api/post/${id}`);

  return {
    props: { postDetails: res.data },
  };
};

export default Detail