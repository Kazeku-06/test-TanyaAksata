<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use App\Models\Post;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    // Toggle bookmark (add or remove)
    public function toggle(Request $request, $postId)
    {
        $user = $request->user();
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        $bookmarkId = null;
        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
            $message = 'Bookmark removed';
        } else {
            $newBookmark = Bookmark::create([
                'user_id' => $user->id,
                'post_id' => $post->id
            ]);
            $isBookmarked = true;
            $bookmarkId = $newBookmark->id;
            $message = 'Bookmark added';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'is_bookmarked' => $isBookmarked,
                'bookmark_id' => $bookmarkId
            ]
        ]);
    }

    // Daftar bookmark user yang login
    public function index(Request $request)
    {
        $bookmarks = Bookmark::with('post.user', 'post.category', 'post.tags')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json(['success' => true, 'data' => $bookmarks]);
    }

    // Hapus bookmark by id (opsional)
    public function destroy(Request $request, $id)
    {
        $bookmark = Bookmark::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();
        if (!$bookmark) {
            return response()->json(['success' => false, 'message' => 'Bookmark not found'], 404);
        }
        $bookmark->delete();
        return response()->json(['success' => true, 'message' => 'Bookmark deleted']);
    }
}
