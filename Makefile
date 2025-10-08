.PHONY: serve build install clean watch-ts

serve:
	@echo "Starting TypeScript watch and Jekyll serve..."
	@make watch-ts & yarn tsc assets/js/orbit.ts --target ES2015 --outDir assets/js && bundle exec jekyll serve --host 0.0.0.0

watch-ts:
	@yarn tsc assets/js/orbit.ts --target ES2015 --outDir assets/js --watch

build:
	bundle exec jekyll build

install:
	bundle install

clean:
	rm -rf _site .jekyll-cache

dev: serve