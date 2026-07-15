<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Download;
use App\Models\Wishlist;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $downloads = Download::where('user_id', $user->id)
            ->with(['app.latestRelease', 'release'])
            ->latest('downloaded_at')
            ->get();
            
        $wishlists = Wishlist::where('user_id', $user->id)
            ->with(['app.latestRelease'])
            ->latest()
            ->get();

        $notifications = $user->notifications()->latest()->get();
        // Mark as read immediately when dashboard is visited for simplicity
        $user->unreadNotifications->markAsRead();

        return view('pages.user-dashboard', compact('user', 'downloads', 'wishlists', 'notifications'));
    }
    
    public function toggleWishlist(Request $request)
    {
        $request->validate(['app_id' => 'required|exists:apps,id']);
        
        $user = Auth::user();
        $wishlist = Wishlist::where('user_id', $user->id)->where('app_id', $request->app_id)->first();
        
        if ($wishlist) {
            $wishlist->delete();
            return response()->json(['status' => 'removed']);
        } else {
            Wishlist::create(['user_id' => $user->id, 'app_id' => $request->app_id]);
            return response()->json(['status' => 'added']);
        }
    }
}
