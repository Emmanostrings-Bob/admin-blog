import Post from "../models/Post";

export async function getPosts() {
  return await Post.find().lean();
}

export async function getPost(id: string) {
  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");
  return post;
}

export async function createPost(data: { title: string; content: string }, userId: string) {
  const post = await Post.create({ ...data, userId });
  return { message: "Post created", post };
}

export async function updatePost(
  id: string,
  data: { title?: string; content?: string },
  user: { id: string; role: string }
) {
  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");

  if (user.role !== "admin" && post.userId !== user.id)
    throw new Error("Unauthorized: You can only edit your own posts");

  Object.assign(post, data);
  await post.save();

  return { message: "Post updated", post };
}

export async function deletePost(id: string, user: { id: string; role: string }) {
  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");

  if (user.role !== "admin" && post.userId !== user.id)
    throw new Error("Unauthorized: You can only delete your own posts");

  await post.deleteOne();
  return { message: "Post deleted", post };
}
