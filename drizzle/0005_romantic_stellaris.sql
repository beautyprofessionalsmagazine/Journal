ALTER TABLE "articles"
  ALTER COLUMN "cover_image" SET DATA TYPE jsonb
  USING CASE
    WHEN "cover_image" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'src', "cover_image",
      'alt', COALESCE("cover_image_alt", ''),
      'settings', jsonb_build_object(
        'version', 3,
        'crops', jsonb_build_object(
          'homepageFeature', COALESCE("cover_image_settings"->'crops'->'homepageFeature', "cover_image_settings"->'customCrops'->'homepageFeature', "cover_image_settings"->'sharedCrops'->'homepageFeature', '{}'::jsonb),
          'storyCard', COALESCE("cover_image_settings"->'crops'->'storyCard', "cover_image_settings"->'customCrops'->'storyCard', "cover_image_settings"->'sharedCrops'->'storyCard', '{}'::jsonb),
          'portraitRail', COALESCE("cover_image_settings"->'crops'->'portraitRail', "cover_image_settings"->'customCrops'->'portraitRail', "cover_image_settings"->'sharedCrops'->'portraitRail', '{}'::jsonb),
          'articleHero', COALESCE("cover_image_settings"->'crops'->'articleHero', "cover_image_settings"->'customCrops'->'articleHero', "cover_image_settings"->'sharedCrops'->'articleHero', '{}'::jsonb)
        ),
        'generatedImages', COALESCE("cover_image_settings"->'generatedImages', '{}'::jsonb),
        'generationKey', "cover_image_settings"->'generationKey'
      )
    )
  END;--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "cover_image_alt";--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "cover_image_settings";
