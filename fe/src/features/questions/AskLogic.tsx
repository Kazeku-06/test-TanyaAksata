"use client";

import { useRouter } from "next/navigation";
import { useCreatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useAskForm } from "./useAskForm";
import { type CreatePostFormData } from "@/lib/schemas";
import AskView from "./AskView";

// AskLogic — mengelola logic halaman "Ajukan Pertanyaan"
// - Fetch kategori untuk dropdown
// - Handle submit form → POST /posts
// - Map error API ke field form
export default function AskLogic() {
  const router = useRouter();
  const { mutate: createPost, isPending } = useCreatePost();
  const { data: categories, isLoading: isLoadingCategories } = useCategories(true);

  const {
    form,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
  } = useAskForm();

  const { setError, formState: { errors } } = form;

  function handleSubmit(data: CreatePostFormData) {
    createPost(
      {
        title: data.title,
        body: data.body,
        category_id: data.category_id,
        tags: data.tags,
      },
      {
        onSuccess: (post) => {
          router.push(`/questions/${post.id}`);
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { errors?: Record<string, string[]>; message?: string } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors) {
            for (const [key, messages] of Object.entries(apiErrors)) {
              setError(key as keyof CreatePostFormData, { message: messages[0] });
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
    <AskView
      form={form}
      isPending={isPending}
      rootError={errors.root?.message}
      categories={categories ?? []}
      isLoadingCategories={isLoadingCategories}
      tags={tags}
      tagInput={tagInput}
      onSubmit={form.handleSubmit(handleSubmit)}
      onTagInputChange={setTagInput}
      onTagKeyDown={handleTagKeyDown}
      onTagBlur={addTag}
      onTagRemove={removeTag}
      onCancel={() => router.back()}
    />
  );
}
