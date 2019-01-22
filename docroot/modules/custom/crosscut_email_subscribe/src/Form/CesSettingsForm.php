<?php

namespace Drupal\crosscut_email_subscribe\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class CesSettingsForm.
 */
class CesSettingsForm extends ConfigFormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'crosscut_email_subscribe_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'crosscut_email_subscribe.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('crosscut_email_subscribe.settings');

    $form['debug'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Enable debug mode'),
      '#description' => $this->t('Debug mode logs detailed information
        throughout the process of subscribing an email address to a list.'),
      '#default_value' => $config->get('debug'),
    );

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->configFactory->getEditable('crosscut_email_subscribe.settings')
      ->set('debug', (bool) $form_state->getValue('debug'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}
