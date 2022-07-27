# The Misinformation Game Documentation

You can read the documentation for The Misinformation Game at
[https://themisinformationgame.github.io](https://themisinformationgame.github.io).

The documentation itself lives in two places on GitHub,

1) the `/docs/` directory in the
[MisinformationGame repository](https://github.com/TheMisinformationGame/MisinformationGame)

2) the
[themisinformationgame.github.io repository](https://github.com/TheMisinformationGame/themisinformationgame.github.io)

The `/docs/` directory is considered to be the ground-truth for the documentation,
and therefore any documentation changes should be made there. More information
about the repositories is below:

## 1) The /docs/ directory in the MisinformationGame repository

The `/docs/` directory is the right place to be to edit The Misinformation Game's
documentation. The files you will most likely want to edit end in `.md`, and
are Markdown documents. The specific Markdown compiler that we use is
[Kramdown](https://kramdown.gettalong.org/index.html). A quick-reference
site for formatting using this version of Markdown can be found at
[https://kramdown.gettalong.org/quickref.html](https://kramdown.gettalong.org/quickref.html).

However, Markdown only gives you limited support over formatting. Therefore,
we use [Jekyll](https://jekyllrb.com/) to build the websites with more complex
formatting (such as the header on the website, or the `#` links to
specific sections of pages). You may also see some inclusion of HTML in the pages
to support more complex formatting and functionality. For example, the headers in
the [Study Configuration page](StudyConfiguration.md) use HTML elements instead of
the Markdown supported headers. This is done to add an `id` attribute to the headers
so that they can be directly linked to by clicking the `#` to the right of the
headers in the documentation website.

## 2) The themisinformationgame.github.io repository

This is the repository that GitHub fetches from to update the documentation
website. Therefore, to see your changes on the live website, your changes
will need to be added here as well.

We use the MisinformationGame repository's `/docs/` directory as the ground-truth for
the documentation. No changes should be made in the themisinformationgame.github.io
repository directly. Instead, if you have made changes to the documentation in the `/docs/`
directory of the
[MisinformationGame repository](https://github.com/TheMisinformationGame/MisinformationGame),
they can be added here using the following procedure:

**Step 0: Clone the MisinformationGame repository locally**

You only need to do this step _once_.
```
git clone git@github.com:TheMisinformationGame/MisinformationGame.git
```

This will create a directory named `MisinformationGame` in your current
directory. You can use the path to that folder for the `<path/to/your/clone>`
in the next step.


### Step 1: Pull the changes you made from the MisinformationGame repository

```
cd <path/to/your/clone>;
git pull origin main
```

### Step 2: Change directory into the /docs/ directory

```
cd docs
```

### Step 3: Add the changes you have made as a new commit

```
git add --all;
git commit -m "A description of your changes"
```

### Step 4: Push your changes to the themisinformationgame.github.io repository

```
git push origin main
```

### Step 5: Wait for your changes to become live

Your changes may take a little while to show up on the
live website. You can view the progress of the deployment
of your changes on the
[deployments page](https://github.com/TheMisinformationGame/themisinformationgame.github.io/deployments)
of the themisinformationgame.github.io repository.
