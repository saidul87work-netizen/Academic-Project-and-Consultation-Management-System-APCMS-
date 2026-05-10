interface Props {
  value: number
  onChange: (val: number) => void
}

const StarRating = ({ value, onChange }: Props) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-3xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default StarRating