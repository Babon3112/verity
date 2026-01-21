"use client";

import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

const PostCardSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <PostCardSkeleton key={idx} />
      ))}
    </>
  );
};

export default PostCardSkeletonList;
