"use client";

import { useRouter } from "next/navigation";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useEditForm } from "./useEditForm";
import { type UpdatePostFormData } from "@/lib/schemas";
import EditView from "./EditView";

interface EditLogicProps {
  postId: string;
}

export default function EditLogic({ postId }: EditLogicProps) {
  const router = useRouter();
  const { data: post, isLoading: isLoadingPost, isError: isPostError } = usePost(postId);
  const { mutate: updatePost, isPending } = useUpdatePost(postId);
  const { data: categories, isLoading: isLoadingCategories } = useCategories(true);

  const {
    form,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
  } = useEditForm(post);

  const { setError, formState: { errors } } = form;

  function handleSubmit(data: UpdatePostFormData) {
    updatePost(
      {
        title: data.title,
        body: data.body,
        category_id: data.category_id,
        tags: data.tags,
        edit_summary: data.edit_summary || undefined,
      },
      {
        onSuccess: () => {
          router.push(`/questions/${postId}`);
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { errors?: Record<string, string[]>; message?: string } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors) {
            for (const [key, messages] of Object.entries(apiErrors)) {
              setError(key as keyof UpdatePostFormData, { message: messages[0] });
            }
          } else {
            setError("root", {
              message: axiosErr?.response?.data?.message || "Terjadi kesalahan",
            });
          }
        },
      }
    );
  }

  return (
    <EditView
      form={form}
      isPending={isPending}
      rootError={errors.root?.message}
      isLoadingPost={isLoadingPost}
      isPostError={isPostError}
      categories={categories ?? []}
      isLoadingCategories={isLoadingCategories}
      tags={tags}
      tagInput={tagInput}
      editCount={post?.edit_count ?? 0}
      onSubmit={form.handleSubmit(handleSubmit)}
      onTagInputChange={setTagInput}
      onTagKeyDown={handleTagKeyDown}
      onTagBlur={addTag}
      onTagRemove={removeTag}
      onCancel={() => router.back()}
    />
  );
}
