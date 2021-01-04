module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-exec');

    grunt.initConfig({
        wiredep: {
            task: {
                src: './src/index.html' // point to your HTML file.
            }
        },

        copy: {
            copy_src: {
                src: 'src/**/*',        // copy all files and subfolders
                dest: 'public',         // destination folder
                expand: true            // required when using cwd
            },

            copy_contract_json: {
                src: 'build/contracts/**/*',    // copy all files and subfolders
                dest: 'public',                 // destination folder
                expand: true                    // required when using cwd
            }
        },

        bowercopy: {
            options: {
                srcPrefix: 'bower_components'
            },
            // Javascript
            libs: {
                options: {
                    destPrefix: 'public/bower_components'
                },
                files: {
                    'jquery/dist/jquery.min.js': 'jquery/dist/jquery.min.js',
                    'web3/dist/web3.min.js': 'web3/dist/web3.min.js',
                    'marked/lib/marked.js': 'marked/lib/marked.js'
                },
            }
        },

        clean: {
            folder: ['public']
        },

        exec: {
            upload: {
                cmd: 'ipfs add -r public'
            }
        }
    });

    grunt.task.registerTask('public', function () {
        grunt.log.header('Copying files');
        grunt.task.run('copy');
        grunt.task.run('bowercopy');
    });

    grunt.task.registerTask('all', function () {
        grunt.log.header('Cleaning things up');
        grunt.task.run('clean');
        grunt.log.header('Copying files');
        grunt.task.run('copy');
        grunt.task.run('bowercopy');
        grunt.log.header('Uploading files to IPFS');
        grunt.task.run('exec');
    });
};