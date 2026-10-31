
const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    shared_with: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    }],

    elements: [{
        type: mongoose.Schema.Types.Mixed
    }]

}, { timestamps: true ,
    collection:'canvas'
});

canvasSchema.statics.getcanvases = async function (email) {
    const user = await mongoose.model('User').findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    const canvases = await this.find({
        $or: [{ owner: user._id }, { shared_with: user._id }]
    })
        .select('-elements')
        .sort({ updatedAt: -1 })
        .lean();

    return canvases.map((c) => ({
        ...c,
        isOwner: String(c.owner) === String(user._id),
    }));
};
canvasSchema.statics.createcanvas= async function(email,name){
    try{
      const user = await mongoose.model('User').findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }
      const canvas = new this({
        name,
        owner: user._id,
        shared_with: [],
        elements: [],
    });
    await canvas.save();
    return canvas;
    } catch(err){
         throw err;
    }
}
canvasSchema.statics.getcanvasbyid = async function (email, id) {
    try {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error('Canvas not found');
        }

        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const canvas = await this.findById(id).lean();
        if (!canvas) {
            throw new Error('Canvas not found');
        }

        const userId = String(user._id);
        const isOwner = String(canvas.owner) === userId;
        const isShared = (canvas.shared_with || []).some(
            (sharedId) => String(sharedId) === userId
        );

        if (!isOwner && !isShared) {
            throw new Error('Canvas not found');
        }

        return canvas;
    } catch (err) {
        throw err;
    }
};
canvasSchema.statics.updatecanvas = async function (id, email, elements) {
    try {
        const user = await mongoose.model('User').findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        const canvas = await this.findById(id);

        if (!canvas) {
            throw new Error('Canvas not found');
        }

        const isOwner = canvas.owner.equals(user._id);

        const isShared = canvas.shared_with.some(
            userId => userId.equals(user._id)
        );

        if (!isOwner && !isShared) {
            throw new Error('You are not authorized to update this canvas');
        }

        canvas.elements = elements;

        await canvas.save();

        return canvas;
    } catch (err) {
        throw err;
    }
};
canvasSchema.statics.deletecanvas = async function (id, email) {
    try {
        const user = await mongoose.model('User').findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        const canvas = await this.findById(id);

        if (!canvas) {
            throw new Error('Canvas not found');
        }

        if (!canvas.owner.equals(user._id)) {
            throw new Error('You are not authorized to delete this canvas');
        }

        await this.findByIdAndDelete(id);

        return canvas;
    } catch (err) {
        throw err;
    }
};
canvasSchema.statics.renamecanvas = async function (email, id, name) {
    try {
        const user = await mongoose.model('User').findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        const canvas = await this.findById(id);

        if (!canvas) {
            throw new Error('Canvas not found');
        }

        if (!canvas.owner.equals(user._id)) {
            throw new Error('You are not authorized to rename this canvas');
        }

        canvas.name = name;
        await canvas.save();

        return canvas;
    } catch (err) {
        throw err;
    }
};
canvasSchema.statics.sharecanvas = async function (ownerEmail, id, targetEmail) {
    try {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error('Canvas not found');
        }

        const User = mongoose.model('User');

        const owner = await User.findOne({ email: ownerEmail });
        if (!owner) {
            throw new Error('User not found');
        }

        const canvas = await this.findById(id);
        if (!canvas) {
            throw new Error('Canvas not found');
        }

        if (!canvas.owner.equals(owner._id)) {
            throw new Error('You are not authorized to share this canvas');
        }

        const target = await User.findOne({ email: targetEmail });
        if (!target) {
            throw new Error('No user found with that email');
        }

        if (target._id.equals(owner._id)) {
            throw new Error("You can't share a canvas with yourself");
        }

        const alreadyShared = canvas.shared_with.some((u) => u.equals(target._id));
        if (alreadyShared) {
            throw new Error('Already shared with this user');
        }

        await this.updateOne({ _id: id }, { $addToSet: { shared_with: target._id } });

        return { id: target._id, name: target.name, email: target.email };
    } catch (err) {
        throw err;
    }
};
canvasSchema.statics.saveelements = async function (userId, canvasId, elements) {
    if (!mongoose.isValidObjectId(canvasId)) return false;

    const result = await this.updateOne(
        {
            _id: canvasId,
            $or: [{ owner: userId }, { shared_with: userId }],
        },
        { $set: { elements } }
    );

    return result.matchedCount === 1;
};
module.exports = mongoose.model('Canvas', canvasSchema);
