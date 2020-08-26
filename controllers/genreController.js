var Genre = require('../models/genre');
var Book = require('../models/book');
var validator = require('express-validator');

var async = require('async');

// Display list of all Genre.
exports.genre_list = function(req, res) {
     Genre.find()
     .populate('genre')
     .exec(function(err, list_genres) {
         if(err) { return next(err); }

         //successfull, so render
         res.render('genre_list', {title: 'Genre List', genre_list: list_genres});
     });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },
    },function(err, results) {
        if(err) {return next(err);}
        if(results.genre == null) {
            //No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        // Successful, so render
        res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate that the name field is not empty
    validator.body('name', 'Genre name required').trim().isLength({min: 1}),

    // Sanitize request after validation and sanitization
    validator.sanitizeBody('name').escape(),

    (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validator.validationResult(req);
        console.log('111111111111111111111');
        // Create a genre object with escaped and trimmed data
        var genre = new Genre(
            {name: req.body.name }
        );

        if(!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/errors messages.
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
            .exec( function(err, found_genre) {
                if(err) { return next(err); }

                if(found_genre) {
                    // Genre exists, redirect to its detail page.
                    res.redirect(found_genre.url);
                }
                else {
                    genre.save(function(err) {
                        if(err) { return next(err); }
                        //Genre saved. Redirect to genre detail page
                        res.redirect(genre.url);
                    });
                }
            });
        }

    }


];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};