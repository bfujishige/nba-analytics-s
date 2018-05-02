var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SECRET = process.env.SECRET;

module.exports = {
  signup,
  login,
  index,
  searchUsers,
  show
};

function signup(req, res) {
  // var user = new User(req.body);
  // user.save()
  //   .then(user => {
  //     // TODO: Send back a JWT instead of the user
  //     res.json({token: createJWT(user)});
  //   })
  //   // User data invalid
  //   .catch(err => res.status(400).json(err));
  console.log(req.body);
  User.create(req.body, (err, user) => {

    res.json({success: true, message: "GREAT SUCCESS", user})
  })
}

function login(req, res) {
  User.findOne({email: req.body.email}).exec().then(user => {
    if (!user) return res.status(401).json({err: 'bad credentials'});
    user.comparePassword(req.body.pw, (err, isMatch) => {
      if (isMatch) {
        var token = createJWT(user);
        res.json({token});
      } else {
        return res.status(401).json({err: 'bad credentials'});
      }
    });
  }).catch(err => res.status(401).json(err));
}

function index(req, res){
  User.findById(req.user)
    .populate('lists')
    .populate({
      path: 'friends',
      populate: {
        path: 'lists',
        model: 'Podcast'
      }
    })
    .exec((err, user) => {
      res.status(200).json(user);
    })
};

function searchUsers(req, res){
  var re = '(.*)' + req.body.searchValue + '(.*)';
  var reg = new RegExp(re, 'gi');

  User.find({name: reg})
    .populate('lists')
    .populate('friends')
    .exec((err, users) => {
      res.status(200).json(users);
    })
}

function show(req, res){
  User.findById(req.params.id)
    .populate('lists')
    .exec((err, user) => {
      res.status(200).json(user);
    })
}

/*----- Helper Functions -----*/

function createJWT(user) {
  return jwt.sign(
    {user}, // data payload
    SECRET,
    {expiresIn: '24h'}
  );
}
