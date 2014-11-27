# Backbase CXP components

Demo bundle for Backbase CXP http://backbase.com.

Tested with Launchpad 11 archetype on dev environment.

## Installation instructions

```
cd {your-backbase-project}
git clone https://github.com/operatino/backbase-robert.git bundles/backbase-robert/src/main/webapp/static
```

### Dependencies

```
cd bundles/backbase-robert/src/main/webapp/static/backbase-robert
bower install
```

### Add conf po Portal Serve pom.xml

Configure path to your widget, to serve this bundle contents as static:

```
<resourceBase>${project.parent.basedir}/bundles/backbase-robert/src/main/webapp</resourceBase>
```