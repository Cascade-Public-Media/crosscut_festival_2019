<?php

namespace Drupal\crosscut_email_subscribe\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;

/**
 * Defines a block that displays the "Quick Subscribe" form.
 *
 * @Block(
 *   id = "crosscut_email_subscribe_quick_subscribe_block",
 *   admin_label = @Translation("Quick Subscribe block"),
 *   category = @Translation("Crosscut Email Subscribe"),
 * )
 *
 * @see \Drupal\crosscut_email_subscribe\Form\QuickSubscribeForm
 */
class QuickSubscribeBlock extends BlockBase implements BlockPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $config = $this->getConfiguration();
    $lists = crosscut_email_subscribe_lists();

    $form['prefix'] = [
      '#type' => 'text_format',
      '#format' => 'basic_html',
      '#title' => $this->t('Form prefix'),
      '#description' => $this->t('This content will appear above the form.'),
    ];
    if (isset($config['prefix'])) {
      $form['prefix']['#default_value'] = $config['prefix']['value'];
      $form['prefix']['#format'] = $config['prefix']['format'];
    }

    $form['list_options'] = [
      '#type' => 'checkboxes',
      '#multiple' => TRUE,
      '#options' => $lists,
      '#title' => $this->t('Available mailing lists'),
      '#description' => $this->t('Choose which lists are available to 
        subscribe to. If <strong>only one</strong> is selected, no options will 
        be presented to the user. If <strong>none</strong> are selected, all 
        lists will be available.')
    ];

    if (isset($config['list_options'])) {
      foreach ($config['list_options'] as $key => $value) {
        $form['list_options'][$key] = [
          '#default_value' => $value,
        ];
      }
    }

    $form['auto_enroll'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Add submitted email addresses to all selected 
        <strong>Available mailing lists</strong> automatically.'),
    ];
    if (isset($config['auto_enroll'])) {
      $form['auto_enroll']['#default_value'] = $config['auto_enroll'];
    }

    /* @todo Add a generic formatted text field and template. */
    $form['form_redirect'] = [
      '#type' => 'entity_autocomplete',
      '#title' => $this->t('Post-submit node'),
      '#description' => $this->t('Node to redirect users to after 
        submitting the subscribe form.'),
      '#target_type' => 'node',
    ];
    if (isset($config['form_redirect']) && !empty($config['form_redirect'])) {
      $node = Node::load($config['form_redirect']);
      $form['form_redirect']['#default_value'] = $node;
    }

    $form['suffix'] = [
      '#type' => 'text_format',
      '#format' => 'basic_html',
      '#title' => $this->t('Form suffix'),
      '#description' => $this->t('This content will appear below the form.'),
    ];
    if (isset($config['suffix'])) {
      $form['suffix']['#default_value'] = $config['suffix']['value'];
      $form['suffix']['#format'] = $config['suffix']['format'];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $values = $form_state->getValues();
    $this->configuration['auto_enroll'] = $values['auto_enroll'];
    $this->configuration['form_redirect'] = $values['form_redirect'];
    $this->configuration['prefix'] = $values['prefix'];
    $this->configuration['suffix'] = $values['suffix'];

    // Remove unselected values from the saved configuration array.
    $list_options = array();
    foreach ($values['list_options'] as $list => $selected) {
      if ($selected) {
        $list_options[$list] = $list;
      }
    }
    $this->configuration['list_options'] = $list_options;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $config = $this->getConfiguration();
    $form = \Drupal::formBuilder()->getForm(
      'Drupal\crosscut_email_subscribe\Form\QuickSubscribeForm',
      $config
    );
    $form['#title'] = $this->label();

    if (isset($config['prefix']) && !empty($config['prefix']['value'])) {
      $build['prefix'] = [
        '#type' => 'html_tag',
        '#tag' => 'div',
        '#value' => $config['prefix']['value'],
        '#attributes' => ['class' => ['quick-subscribe-form-prefix']]
      ];
    }

    $build['form'] = $form;

    if (isset($config['suffix']) && !empty($config['suffix']['value'])) {
      $build['suffix'] = [
        '#type' => 'html_tag',
        '#tag' => 'div',
        '#value' => $config['suffix']['value'],
        '#attributes' => ['class' => ['quick-subscribe-form-prefix']]
      ];
    }

    return $build;
  }
}
