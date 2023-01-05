import numpy as np

import tensorflow as tf
import tensorflow.keras.models as models
import tensorflow.keras.layers as layers
import tensorflow.keras.optimizers as optimizers
import tensorflow.keras.callbacks as callbacks

BATCHES = 50

def normalise_scores(scores):
    """normalise scores between 0 and 1"""
    return np.asarray(scores / abs(scores).max() / 2 + 0.5)

def load_dataset(batches, stockfish_depth):
    file_counter = 1
    path=f'data/batches/depth/{stockfish_depth:02d}'
    data = np.load(f'{path}/batch_{file_counter:02d}.npz')
    x_train, y_train = data['bitboards'], data['scores']
    while file_counter < batches:
        file_counter += 1
        new_data = np.load(f'{path}/batch_{file_counter:02d}.npz')
        x_train = np.append(x_train, new_data['bitboards'], axis=0)
        y_train = np.append(y_train, new_data['scores'])
    y_train = normalise_scores(y_train)
    return x_train, y_train

def build_model(conv_size, conv_depth, dense_units):
    inputs = layers.Input(shape=(12, 8, 8))

    # adding the convolutional layers
    x = inputs
    for _ in range(conv_depth):
        x = layers.Conv2D(
            filters=conv_size,
            kernel_size=(3, 3),
            padding='same',
            activation='relu',
            data_format='channels_first'
        )(x)

    x = layers.Flatten()(x)
    x = layers.Dense(dense_units, activation='relu')(x)
    x = layers.Dense(1, activation='sigmoid')(x)

    return models.Model(inputs=inputs, outputs=x)

tf.keras.utils.set_random_seed(42)

number_filters = 128
number_conv_layers = 2
dense_layer_units = 128
batches=500
batch_size = 16000
stockfish_depth = 1
model = build_model(number_filters, number_conv_layers, dense_layer_units) # initial 32, 4, 64
x_train, y_train = load_dataset(batches=batches, stockfish_depth=stockfish_depth)

model.compile(optimizer=optimizers.Adam(5e-5), loss='mean_squared_error')
model.summary()
model.fit(x_train, y_train,
          batch_size=batch_size,
          epochs=100,
          verbose=1,
          validation_split=0.2,
          callbacks=[callbacks.ReduceLROnPlateau(monitor='val_loss', patience=5, min_delta=1e-6, factor=0.2),
                     callbacks.EarlyStopping(monitor='val_loss', patience=20, min_delta=1e-6)])

model.save(f'../models/model_{number_filters}_filters_{number_conv_layers}_conv_layers_{dense_layer_units}_dense_units_{batch_size}_batch_size_{stockfish_depth}_depth_{batches}_batches.h5')
print('New model saved')
