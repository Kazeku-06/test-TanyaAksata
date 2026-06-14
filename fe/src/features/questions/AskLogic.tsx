"use client";

import { useRouter } from "next/navigation";
import { useCreatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useMe } from "@/hooks/useAuth";
import { useAskForm } from "./useAskForm";
import { type CreatePostFormData } from "@/lib/schemas";
import AskView from "./AskView";

export default function AskLogic() {
  const router = useRouter();
  const { data: me } = useMe();
  const { mutate: createPost, isPending } = useCreatePost();
  const { data: categories, isLoading: isLoadingCategories } = useCategories(true);

  const { form, tags, tagInput, setTagInput, addTag, removeTag, handleTagKeyDown } = useAskForm();
  const { setError, formState: { errors } } = form;

  const isBlocked = !!me && me.reputation < 20;

  function handleSubmit(data: CreatePostFormData) {
    createPost(
      { title: data.title, body: data.body, category_id: data.category_id, tags: data.tags },
      {
        onSuccess: (post) => router.push(`/questions/${post.id}`),
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
            setError("root", { message: axiosErr?.response?.data?.message || "Terjadi kesalahan" });
          }
        },
      }
    );
  }

  return (
    <>
      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center">
            <p className="text-lg font-semibold text-[#c91d2e] mb-2">Reputasi Tidak Cukup</p>
            <p className="text-sm text-[#525960] mb-4">
              Butuh minimal <span className="font-semibold text-[#232629]">20 poin reputasi</span> untuk membuat postingan.{" "}
              Reputasi kamu saat ini:{" "}
              <span className="font-semibold text-[#232629]">{me!.reputation} poin</span>.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
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
    </>
  );
}
