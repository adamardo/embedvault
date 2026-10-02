import { Star } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";

// A plain <form> that calls a Server Action — no client-side JavaScript
// needed just to toggle a boolean.
export default function FavoriteButton({ entryId, isFavorite }: { entryId: string; isFavorite: boolean }) {
  return (
    <form action={toggleFavorite}>
      <input type="hidden" name="entryId" value={entryId} />
      <button
        type="submit"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
          isFavorite
            ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
            : "border-white/10 text-gray-300 hover:bg-white/5"
        }`}
      >
        <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        {isFavorite ? "Favorited" : "Favorite"}
      </button>
    </form>
  );
}
