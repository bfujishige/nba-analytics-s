const
  mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),

  userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, required: true, lowercase: true, unique: true},
     password: {type: String, select: false}, // select: false to avoid selecting sensitive fields
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
  }, {
    timestamps: true
  });

  // hash the PW and encrypt it
  userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  }

  userSchema.methods.comparePassword = function(tryPassword, cb) {
    bcrypt.compare(tryPassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  };

  // compare stored PW to currentPW
  userSchema.methods.validPassword = function(password){
    if(!password) return false
    return bcrypt.compareSync(password, this.password)
  }

  // encrypt PW before saving PW
  userSchema.pre('save', function(next){
    if(!this.isModified('password')) return next()
    this.password = this.generateHash(this.password)
    next()
  });

  module.exports = mongoose.model('User', userSchema)
