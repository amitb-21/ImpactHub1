import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratedEntity: {
      entityType: {
        type: String,
        enum: ['Community', 'Event'],
        required: true,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'ratedEntity.entityType',
      },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    isVerifiedParticipant: {
      type: Boolean,
      default: false,
      description: 'True if user attended/participated in the event/community',
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate ratings - one user can rate an entity only once
ratingSchema.index({ ratedBy: 1, 'ratedEntity.entityId': 1, 'ratedEntity.entityType': 1 }, { unique: true });

// Middleware to update entity rating aggregate
ratingSchema.post('save', async function () {
  await updateEntityRating(this.ratedEntity.entityType, this.ratedEntity.entityId);
});

ratingSchema.post('findByIdAndDelete', async function (doc) {
  if (doc) {
    await updateEntityRating(doc.ratedEntity.entityType, doc.ratedEntity.entityId);
  }
});

async function updateEntityRating(entityType, entityId) {
  const Rating = mongoose.model('Rating');
  const ratings = await Rating.find({
    'ratedEntity.entityType': entityType,
    'ratedEntity.entityId': entityId,
  });

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
    : 0;

  if (entityType === 'Community') {
    const Community = mongoose.model('Community');
    await Community.findByIdAndUpdate(entityId, {
      avgRating,
      totalRatings: ratings.length,
    });
  } else if (entityType === 'Event') {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(entityId, {
      avgRating,
      totalRatings: ratings.length,
    });
  }
}

const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
export default Rating;