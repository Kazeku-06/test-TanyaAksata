<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // Daftar kategori (publik) — cached 5 menit
    public function index(Request $request)
    {
        $flat = $request->has('flat');
        $key  = CacheService::categoriesKey($flat);

        $categories = Cache::remember($key, CacheService::TTL_MEDIUM, function () use ($flat) {
            if ($flat) {
                return Category::orderBy('name')->get()->toArray();
            }
            return Category::with('children')->whereNull('parent_id')->orderBy('sort_order')->get()->toArray();
        });

        return response()->json(['success' => true, 'data' => $categories]);
    }

    // Detail kategori (publik)
    public function show($id)
    {
        $category = Category::with(['children', 'parent'])->find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $category]);
    }

    // Buat kategori (admin/moderator)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string|max:255',
            'parent_id'   => 'nullable|uuid|exists:categories,id',
            'sort_order'  => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $slug         = Str::slug($request->name);
        $originalSlug = $slug;
        $count        = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $category = Category::create([
            'name'        => $request->name,
            'slug'        => $slug,
            'description' => $request->description,
            'parent_id'   => $request->parent_id ?: null,
            'sort_order'  => $request->sort_order ?? 0,
        ]);

        CacheService::invalidateCategories();

        return response()->json(['success' => true, 'message' => 'Category created', 'data' => $category], 201);
    }

    // Update kategori (admin/moderator)
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }

        if (empty($request->all())) {
            return response()->json([
                'success' => false,
                'message' => 'No data provided. Gunakan body "raw" JSON.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:100|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:255',
            'parent_id'   => 'nullable|uuid|exists:categories,id',
            'sort_order'  => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $category->name = $request->name;
            $slug            = Str::slug($request->name);
            $originalSlug    = $slug;
            $count           = 1;
            while (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $category->slug = $slug;
        }

        if ($request->has('description')) $category->description = $request->description;
        if ($request->has('parent_id'))   $category->parent_id   = $request->parent_id ?: null;
        if ($request->has('sort_order'))  $category->sort_order  = $request->sort_order;

        $category->save();

        CacheService::invalidateCategories();

        return response()->json(['success' => true, 'message' => 'Category updated successfully', 'data' => $category]);
    }

    // Hapus kategori (admin/moderator)
    public function destroy(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }
        $category->delete();

        CacheService::invalidateCategories();

        return response()->json(['success' => true, 'message' => 'Category deleted']);
    }
}
