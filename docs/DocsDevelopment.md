---
title: Documentation Development Environment
showPath: true
showBackToTop: false
---

# Documentation Development Environment
This document describes how to set up your development
environment to work on The Misinformation Game documentation
website, and host  it locally for testing.


## 1. Set ./docs as the Current Working Directory

You must navigate your terminal to the ./docs directory
to run the documentation website. If you have cloned the
[themisinformationgame.github.io](https://github.com/TheMisinformationGame/themisinformationgame.github.io)
repository, then this directory will not exist. Please clone
the [MisinformationGame](https://github.com/TheMisinformationGame/MisinformationGame)
repository instead. If your terminal's current working directory
is the MisinformationGame repository, then you may run the following
command to change it to the ./docs directory,

```shell
cd ./docs
```


## 2. Install Ruby Version 2.7
The documentation uses an old version of [Jekyll](https://jekyllrb.com/)
that is supported by [GitHub Pages](https://pages.github.com/). This
version of Jekyll requires [Ruby](https://www.ruby-lang.org/) version 2.7
to run. This version is old. Therefore, the easiest way to install it
is to use [Ruby Version Manager](https://rvm.io/) (RVM).

Once you have RVM installed, you may use the following command to install
Ruby 2.7,

```shell
rvm install 2.7
```


## 3. Activate Ruby Version 2.7

You can activate Ruby 2.7 so that it can be used by Jekyll using the following command,

```shell
rvm use 2.7
```


## 4. Install Jekyll Dependencies

You may now install the dependencies of the GitHub Pages version of Jekyll
using the following command,

```shell
bundle install
```


## 5. Run Jekyll!

You now have all the dependencies installed to run the development website!
The following command will start the documentation website locally, which
will automatically update if you change any of the files. Therefore, you will
only need to reload the page in your browser to see your changes/

```shell
bundle exec jekyll serve --watch -o
```

If the documentation website doesn't open in your browser automatically,
then you can probably still access it directly at [http://127.0.0.1:4000/](http://127.0.0.1:4000/).
