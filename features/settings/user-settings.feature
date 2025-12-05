@settings
Feature: User Settings
  As a learner
  I want to customize my learning experience
  So that the app works best for me

  Background:
    Given I am logged in as a learner

  @US-001
  Scenario: Access settings page
    Given I am on any page
    When I navigate to settings
    Then I should see the settings page
    And I should see all available settings categories

  @US-002 @audio
  Scenario: Toggle audio feedback
    Given I am on the settings page
    When I toggle audio feedback off
    Then correct/incorrect sounds should not play
    And my preference should be saved

  @US-003 @audio
  Scenario: Adjust audio volume
    Given I am on the settings page
    And audio is enabled
    When I adjust the volume slider
    Then the volume should change accordingly
    And my preference should be saved

  @US-004 @haptics
  Scenario: Toggle haptic feedback
    Given I am on the settings page
    And my device supports haptics
    When I toggle haptic feedback
    Then vibration on interactions should change accordingly
    And my preference should be saved

  @US-005 @celebration
  Scenario: Toggle celebration effects
    Given I am on the settings page
    When I toggle confetti celebrations
    Then confetti animations should be enabled/disabled
    And my preference should be saved

  @US-006 @celebration
  Scenario: Toggle celebration sounds
    Given I am on the settings page
    When I toggle celebration sounds
    Then completion sounds should be enabled/disabled
    And my preference should be saved

  @US-007
  Scenario: Settings persist across sessions
    Given I have customized my settings
    When I log out and log back in
    Then my settings should be preserved
    And all my preferences should be applied

  @US-008 @accessibility
  Scenario: Reduce motion setting
    Given I am on the settings page
    When I enable "Reduce motion"
    Then animations should be minimized
    And the app should respect this preference

  @US-009
  Scenario: Reset settings to defaults
    Given I have customized many settings
    When I click "Reset to defaults"
    And I confirm the reset
    Then all settings should return to default values
